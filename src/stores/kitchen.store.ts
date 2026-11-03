import { create } from 'zustand'
import {
  applyCommand,
  createInitialState,
  DEMO_INGREDIENTS,
  DEMO_PRODUCTS,
  fail,
  orderNeeds,
  type CommandType,
  type Ingredient,
  type KitchenCommand,
  type KitchenState,
  type Product,
  type Role,
} from '@/domain'
import { errorMessage } from '@/lib/errors'
import { kitchenApi, type RemoteKitchen } from '@/services/api'
import { kitchenRepository } from '@/services/storage'
import { useAuthStore } from './auth.store'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

/*
 * Origen de los datos:
 * - Backend: insumos, movimientos de stock y pedidos.
 * - Navegador (localStorage): productos y recetas (el backend aún no los expone).
 */

/** Comandos que se envían al backend; el resto se guarda en el navegador. */
const REMOTE_COMMANDS: ReadonlySet<CommandType> = new Set([
  'ingredient/create',
  'stock/move',
  'order/create',
  'order/changeStatus',
])

const emptyRemote = (): RemoteKitchen => ({ ingredients: [], movements: [], orders: [] })

const compose = (products: Product[], remote: RemoteKitchen): KitchenState => ({
  products,
  ingredients: remote.ingredients,
  movements: remote.movements,
  orders: remote.orders.map((o) => kitchenApi.hydrateOrder(o, products)),
})

interface KitchenStore {
  status: LoadStatus
  loadError: string | null
  data: KitchenState
  /** Última respuesta del backend (pedidos sin completar con productos). */
  remote: RemoteKitchen
  /** Revisión de los datos locales (productos), para detectar cambios en otra pestaña. */
  revision: number
  busy: boolean
  load: () => Promise<void>
  /** Vuelve a pedir al backend insumos, movimientos y pedidos. */
  refresh: () => Promise<void>
  /** Valida un comando con las reglas del dominio y lo ejecuta en el backend o en local. */
  dispatch: (command: KitchenCommand) => Promise<void>
}

export const useKitchenStore = create<KitchenStore>()((set, get) => {
  const setRemote = (remote: RemoteKitchen) =>
    set({ remote, data: compose(get().data.products, remote) })

  const setProducts = (products: Product[], revision: number) =>
    set({ revision, data: compose(products, get().remote) })

  /** Guarda los productos en el navegador sin tocar el resto de lo guardado. */
  async function saveProducts(products: Product[]) {
    const saved = await kitchenRepository.read()
    if (saved.revision !== get().revision) {
      setProducts(saved.data.products, saved.revision)
      throw new Error('Los datos cambiaron en otra pestaña. Revisa y vuelve a guardar.')
    }
    const revision = saved.revision + 1
    await kitchenRepository.write({ data: { ...saved.data, products }, revision })
    setProducts(products, revision)
  }

  async function runRemote(
    command: KitchenCommand,
    current: KitchenState,
    next: KitchenState,
    role: Role,
  ) {
    switch (command.type) {
      case 'ingredient/create': {
        const ingredient = next.ingredients.at(-1)!
        const created = await kitchenApi.createIngredient(ingredient)
        // El backend crea el insumo con stock 0: la cantidad inicial se registra como entrada.
        if (ingredient.stock > 0)
          await kitchenApi.moveStock(created.id, {
            kind: 'entrada',
            quantity: ingredient.stock,
            note: 'Stock inicial',
          })
        return
      }
      case 'stock/move': {
        const movement = next.movements.at(-1)!
        await kitchenApi.moveStock(command.payload.id, {
          kind: movement.quantity > 0 ? 'entrada' : 'salida',
          quantity: Math.abs(movement.quantity),
          note: movement.note,
        })
        return
      }
      case 'order/create': {
        const order = next.orders.at(-1)!
        await kitchenApi.createOrder({
          customer: order.customer,
          date: order.date,
          channel: order.channel,
          notes: order.notes,
          items: order.items.map(({ productId, quantity }) => ({ productId, quantity })),
        })
        return
      }
      case 'order/changeStatus': {
        const order = current.orders.find((o) => o.id === command.payload.id)!
        if (command.payload.status === 'Entregado') {
          // El backend no descuenta stock al entregar: se registra una salida por insumo.
          const needs = Object.entries(orderNeeds(order))
          if (needs.length && role !== 'owner')
            fail('Solo el dueño puede marcar pedidos como entregados (se descuenta stock).')
          for (const [ingredientId, quantity] of needs)
            await kitchenApi.moveStock(ingredientId, {
              kind: 'salida',
              quantity,
              note: `Entrega de pedido #${order.number}`,
            })
        }
        await kitchenApi.changeOrderStatus(order.id, command.payload.status)
        return
      }
    }
  }

  /** Crea los insumos de ejemplo en el backend y guarda los productos con sus ids. */
  async function loadDemo() {
    for (const ingredient of DEMO_INGREDIENTS) {
      const created = await kitchenApi.createIngredient(ingredient)
      await kitchenApi.moveStock(created.id, {
        kind: 'entrada',
        quantity: ingredient.stock,
        note: 'Stock inicial',
      })
    }
    await get().refresh()
    const products = remapRecipes(DEMO_PRODUCTS, DEMO_INGREDIENTS, get().remote.ingredients)
    await saveProducts(structuredClone(products))
  }

  return {
    status: 'idle',
    loadError: null,
    data: createInitialState(),
    remote: emptyRemote(),
    revision: 0,
    busy: false,

    load: async () => {
      if (get().status === 'loading') return
      set({ status: 'loading', loadError: null })
      try {
        const [local, remote] = await Promise.all([
          kitchenRepository.read(),
          kitchenApi.fetchRemoteKitchen(),
        ])
        let { revision } = local
        // Recetas creadas antes del backend apuntan a ids locales: se enlazan por nombre.
        const products = remapRecipes(
          local.data.products,
          local.data.ingredients,
          remote.ingredients,
        )
        if (products !== local.data.products) {
          revision += 1
          await kitchenRepository.write({ data: { ...local.data, products }, revision })
        }
        set({ remote, revision, data: compose(products, remote), status: 'ready' })
      } catch (error) {
        set({ status: 'error', loadError: errorMessage(error) })
      }
    },

    refresh: async () => setRemote(await kitchenApi.fetchRemoteKitchen()),

    dispatch: async (command) => {
      const user = useAuthStore.getState().user
      if (!user) throw new Error('Inicia sesión.')
      if (get().busy) throw new Error('Espera a que termine la operación anterior.')

      set({ busy: true })
      try {
        const current = get().data
        // Las reglas de negocio se validan primero en el cliente (mensajes claros, sin ida y vuelta).
        const next = applyCommand(current, command, user.role)

        if (command.type === 'demo/load') {
          await loadDemo()
        } else if (REMOTE_COMMANDS.has(command.type)) {
          try {
            await runRemote(command, current, next, user.role)
          } finally {
            // Aunque falle a mitad de camino, se muestra lo que realmente quedó en el servidor.
            await get()
              .refresh()
              .catch(() => {})
          }
        } else {
          await saveProducts(next.products)
        }
      } finally {
        set({ busy: false })
      }
    },
  }
})

/**
 * Reemplaza en las recetas los ids de insumos que ya no existen por el insumo
 * del backend con el mismo nombre. Devuelve el mismo arreglo si no hubo cambios.
 */
function remapRecipes(
  products: Product[],
  previous: readonly Ingredient[],
  remote: readonly Ingredient[],
): Product[] {
  const remoteIds = new Set(remote.map((i) => i.id))
  const byName = new Map(remote.map((i) => [i.name.trim().toLowerCase(), i.id]))
  let changed = false

  const result = products.map((product) => ({
    ...product,
    recipe: product.recipe.map((line) => {
      if (remoteIds.has(line.ingredientId)) return line
      const name = previous
        .find((i) => i.id === line.ingredientId)
        ?.name.trim()
        .toLowerCase()
      const id = name ? byName.get(name) : undefined
      if (!id) return line
      changed = true
      return { ...line, ingredientId: id }
    }),
  }))

  return changed ? result : products
}

export const useKitchenData = () => useKitchenStore((s) => s.data)

// Al cerrar sesión se descarta el estado en memoria; se vuelve a leer en el próximo ingreso.
useAuthStore.subscribe((auth, prev) => {
  if (prev.user && !auth.user)
    useKitchenStore.setState({
      status: 'idle',
      data: createInitialState(),
      remote: emptyRemote(),
      revision: 0,
    })
})

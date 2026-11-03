import { create } from 'zustand'
import {
  applyCommand,
  createInitialState,
  DEMO_INGREDIENTS,
  DEMO_PRODUCTS,
  type KitchenCommand,
  type KitchenState,
} from '@/domain'
import { errorMessage } from '@/lib/errors'
import { kitchenApi } from '@/services/api'
import { useAuthStore } from './auth.store'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface KitchenStore {
  status: LoadStatus
  loadError: string | null
  data: KitchenState
  busy: boolean
  load: () => Promise<void>
  /** Vuelve a leer todo desde el backend. */
  refresh: () => Promise<void>
  /** Valida un comando con las reglas del dominio y lo ejecuta en el backend. */
  dispatch: (command: KitchenCommand) => Promise<void>
}

/**
 * Traduce un comando de dominio a llamadas al API. `next` es el resultado de
 * aplicarlo localmente: de ahí se toman los datos ya validados y normalizados.
 */
async function runCommand(command: KitchenCommand, next: KitchenState) {
  switch (command.type) {
    case 'product/save': {
      const product = command.payload.id
        ? next.products.find((p) => p.id === command.payload.id)!
        : next.products.at(-1)!
      await kitchenApi.saveProduct(product, command.payload.id)
      return
    }
    case 'recipe/save': {
      const product = next.products.find((p) => p.id === command.payload.id)!
      await kitchenApi.saveRecipe(product.id, product.recipe)
      return
    }
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
    case 'order/changeStatus':
      await kitchenApi.changeOrderStatus(command.payload.id, command.payload.status)
      return
    case 'demo/load':
      await loadDemo()
      return
  }
}

/** Crea en el backend los insumos y productos de ejemplo, con sus recetas. */
async function loadDemo() {
  const idMap = new Map<string, string>()
  for (const ingredient of DEMO_INGREDIENTS) {
    const created = await kitchenApi.createIngredient(ingredient)
    idMap.set(ingredient.id, created.id)
    await kitchenApi.moveStock(created.id, {
      kind: 'entrada',
      quantity: ingredient.stock,
      note: 'Stock inicial',
    })
  }
  for (const product of DEMO_PRODUCTS) {
    const created = await kitchenApi.saveProduct(product)
    await kitchenApi.saveRecipe(
      created.id,
      product.recipe.map((r) => ({ ...r, ingredientId: idMap.get(r.ingredientId)! })),
    )
  }
}

export const useKitchenStore = create<KitchenStore>()((set, get) => ({
  status: 'idle',
  loadError: null,
  data: createInitialState(),
  busy: false,

  load: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', loadError: null })
    try {
      set({ data: await kitchenApi.fetchKitchen(), status: 'ready' })
    } catch (error) {
      set({ status: 'error', loadError: errorMessage(error) })
    }
  },

  refresh: async () => set({ data: await kitchenApi.fetchKitchen() }),

  dispatch: async (command) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Inicia sesión.')
    if (get().busy) throw new Error('Espera a que termine la operación anterior.')

    set({ busy: true })
    try {
      // Las reglas se validan primero en el cliente para dar mensajes inmediatos;
      // el backend vuelve a validarlas y es quien decide.
      const next = applyCommand(get().data, command, user.role)
      try {
        await runCommand(command, next)
      } finally {
        // Aunque falle a mitad de camino, se muestra lo que realmente quedó en el servidor.
        await get()
          .refresh()
          .catch(() => {})
      }
    } finally {
      set({ busy: false })
    }
  },
}))

export const useKitchenData = () => useKitchenStore((s) => s.data)

// Al cerrar sesión se descarta el estado en memoria; se vuelve a leer en el próximo ingreso.
useAuthStore.subscribe((auth, prev) => {
  if (prev.user && !auth.user)
    useKitchenStore.setState({ status: 'idle', data: createInitialState() })
})

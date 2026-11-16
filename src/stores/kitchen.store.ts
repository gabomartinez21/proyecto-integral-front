import { create } from 'zustand'
import { applyCommand, createInitialState, type KitchenCommand, type KitchenState } from '@/domain'
import { errorMessage } from '@/lib/errors'
import { kitchenRepository } from '@/services/storage'
import { apiInsumosService } from '@/services/storage/api-insumos'
import { apiPedidosService } from '@/services/storage/api-pedidos'
import { useAuthStore } from './auth.store'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface KitchenStore {
  status: LoadStatus
  loadError: string | null
  data: KitchenState
  revision: number
  busy: boolean
  load: () => Promise<void>
  dispatch: (command: KitchenCommand) => Promise<void>
}

export const useKitchenStore = create<KitchenStore>()((set, get) => ({
  status: 'idle',
  loadError: null,
  data: createInitialState(),
  revision: 0,
  busy: false,

  load: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', loadError: null })
    try {
      const { data, revision } = await kitchenRepository.read()
      
      try {
        const [insumosBD, productosBD, pedidosBD] = await Promise.all([
          apiInsumosService.fetchInsumos(),
          apiPedidosService.fetchProductos(),
          apiPedidosService.fetchPedidos(),
        ]);
        
        data.ingredients = insumosBD.map((i: any) => ({
          id: String(i.id),
          name: i.name,
          unit: i.unit,
          stock: i.stock,
          minimum: i.minimum,
          cost: i.cost,
        }));

        data.products = productosBD.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          category: p.category,
          price: p.price,
          description: p.description,
          recipe: (p.recipe || []).map((r: any) => ({
            ingredientId: String(r.ingredientId),
            quantity: r.quantity,
          })),
        }));
        
        data.orders = pedidosBD.map((o: any) => ({
          ...o,
          id: String(o.id),
          items: (o.items || []).map((it: any) => ({
            ...it,
            productId: String(it.productId),
            recipe: (it.recipe || []).map((r: any) => ({
              ingredientId: String(r.ingredientId),
              quantity: r.quantity,
            })),
          })),
        }));
      } catch (err) {
        console.error("No se pudo conectar al Backend local.", err);
      }

      set({ data, revision, status: 'ready' })
    } catch (error) {
      set({ status: 'error', loadError: errorMessage(error) })
    }
  },

  dispatch: async (command) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Inicia sesión.')
    if (get().busy) throw new Error('Espera a que termine la operación anterior.')

    set({ busy: true })
    try {
      const cmd = command as any;

      if (cmd.type === 'ingredient/create') {
        const created = await apiInsumosService.createInsumo({
          name: cmd.payload.name,
          unit: cmd.payload.unit,
          minimum: Number(cmd.payload.minimum),
          cost: Number(cmd.payload.cost),
        });
        if (Number(cmd.payload.stock) > 0) {
          await apiInsumosService.updateStock(String(created.id), {
            kind: 'entrada',
            quantity: Number(cmd.payload.stock),
            note: 'Stock inicial',
          });
        }
      } else if (cmd.type === 'stock/move') {
        await apiInsumosService.updateStock(cmd.payload.id, {
          kind: cmd.payload.kind,
          quantity: Number(cmd.payload.quantity),
          note: cmd.payload.note,
        });
      } else if (cmd.type === 'product/save') {
        await apiPedidosService.saveProducto(cmd.payload);
      } else if (cmd.type === 'recipe/save') {
        await apiPedidosService.saveReceta(cmd.payload.id, cmd.payload.recipe);
      } else if (cmd.type === 'order/create') {
        await apiPedidosService.createPedido(cmd.payload);
      } else if (cmd.type === 'order/update' || cmd.type === 'order/edit') {
        await apiPedidosService.updatePedido(cmd.payload.id, cmd.payload);
      } else if (cmd.type === 'order/changeStatus') {
        await apiPedidosService.updateEstado(cmd.payload.id, cmd.payload.status);
      } else {
        const saved = await kitchenRepository.read()
        const next = {
          data: applyCommand(saved.data, command, user.role),
          revision: saved.revision + 1,
        }
        await kitchenRepository.write(next)
      }

      set({ status: 'idle' })
      await get().load(); 
    } finally {
      set({ busy: false })
    }
  },
}))

export const useKitchenData = () => useKitchenStore((s) => s.data)

useAuthStore.subscribe((auth, prev) => {
  if (prev.user && !auth.user)
    useKitchenStore.setState({ status: 'idle', data: createInitialState(), revision: 0 })
})
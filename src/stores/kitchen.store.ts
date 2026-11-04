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
        const insumosBD = await apiInsumosService.fetchInsumos();
        const pedidosBD = await apiPedidosService.fetchPedidos();
        
        data.ingredients = insumosBD.map((i: any) => ({
          id: String(i.id), name: i.name, unit: i.unit, stock: i.stock, minimum: i.minimum, cost: i.cost
        }));
        
        data.orders = pedidosBD;
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

      // >>> CONEXIÓN AL BACKEND <<<
      if (cmd.type === 'ingredient/create') {
        await apiInsumosService.createInsumo(cmd.payload);
      } else if (cmd.type === 'stock/move') {
        await apiInsumosService.updateStock(cmd.payload.id, cmd.payload);
      } else if (cmd.type === 'order/create') {
        await apiPedidosService.createPedido(cmd.payload);
      } else if (cmd.type === 'order/update' || cmd.type === 'order/edit') {
        await apiPedidosService.updatePedido(cmd.payload.id, cmd.payload);
      } else if (cmd.type === 'order/changeStatus') {
        await apiPedidosService.updateEstado(cmd.payload.id, cmd.payload.status);
      }

      const saved = await kitchenRepository.read()
      if (saved.revision !== get().revision) {
        set({ data: saved.data, revision: saved.revision })
        throw new Error('Los datos cambiaron en otra pestaña. Revisa y vuelve a guardar.')
      }
      
      const next = {
        data: applyCommand(saved.data, command, user.role),
        revision: saved.revision + 1,
      }
      
      // Mantenemos la BD local sincronizada con React
      next.data.ingredients = get().data.ingredients;
      next.data.orders = get().data.orders;
      await kitchenRepository.write(next)
      
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
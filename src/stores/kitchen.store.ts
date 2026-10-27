import { create } from 'zustand'
import { applyCommand, createInitialState, type KitchenCommand, type KitchenState } from '@/domain'
import { errorMessage } from '@/lib/errors'
import { kitchenRepository } from '@/services/storage'
import { useAuthStore } from './auth.store'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface KitchenStore {
  status: LoadStatus
  loadError: string | null
  data: KitchenState
  revision: number
  busy: boolean
  load: () => Promise<void>
  /** Ejecuta un comando de dominio y lo persiste. Lanza un error si falla. */
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
      // Control de concurrencia optimista: si otra pestaña guardó antes, no se sobrescribe.
      const saved = await kitchenRepository.read()
      if (saved.revision !== get().revision) {
        set({ data: saved.data, revision: saved.revision })
        throw new Error('Los datos cambiaron en otra pestaña. Revisa y vuelve a guardar.')
      }
      const next = {
        data: applyCommand(saved.data, command, user.role),
        revision: saved.revision + 1,
      }
      await kitchenRepository.write(next)
      set(next)
    } finally {
      set({ busy: false })
    }
  },
}))

export const useKitchenData = () => useKitchenStore((s) => s.data)

// Al cerrar sesión se descarta el estado en memoria; se vuelve a leer en el próximo ingreso.
useAuthStore.subscribe((auth, prev) => {
  if (prev.user && !auth.user)
    useKitchenStore.setState({ status: 'idle', data: createInitialState(), revision: 0 })
})

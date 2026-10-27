import { create } from 'zustand'

interface ToastState {
  message: string | null
  /** Cambia en cada aviso para reiniciar el temporizador aunque el texto se repita. */
  key: number
  show: (message: string) => void
  dismiss: () => void
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  key: 0,
  show: (message) => set((s) => ({ message, key: s.key + 1 })),
  dismiss: () => set({ message: null }),
}))

/** Atajo para usar fuera de componentes. */
export const toast = (message: string) => useToastStore.getState().show(message)

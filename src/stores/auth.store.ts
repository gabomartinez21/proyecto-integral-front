import { create } from 'zustand'
import { authService, type RegisterInput, type SessionUser } from '@/services/auth'

interface AuthState {
  user: SessionUser | null
  login: (username: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: authService.restore(),
  login: async (username, password) => {
    const user = await authService.login(username, password)
    set({ user })
  },
  register: async (input) => {
    const user = await authService.register(input)
    set({ user })
  },
  logout: async () => {
    await authService.logout()
    set({ user: null })
  },
}))

// Si el backend rechaza el token (expirado o inválido), se cierra la sesión en la UI.
authService.onSessionExpired(() => useAuthStore.setState({ user: null }))

// Al cargar la app se valida contra el servidor la sesión guardada.
void authService.verify().then((user) => useAuthStore.setState({ user }))

export const useCurrentUser = () => useAuthStore((s) => s.user)
export const useIsOwner = () => useAuthStore((s) => s.user?.role === 'owner')

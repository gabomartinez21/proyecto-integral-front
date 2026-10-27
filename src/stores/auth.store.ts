import { create } from 'zustand'
import { authService, type SessionUser } from '@/services/auth'

interface AuthState {
  user: SessionUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: authService.restore(),
  login: async (username, password) => {
    const user = await authService.login(username, password)
    set({ user })
  },
  logout: async () => {
    await authService.logout()
    set({ user: null })
  },
}))

export const useCurrentUser = () => useAuthStore((s) => s.user)
export const useIsOwner = () => useAuthStore((s) => s.user?.role === 'owner')

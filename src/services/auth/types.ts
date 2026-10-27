import type { Role } from '@/domain'

export interface SessionUser {
  name: string
  role: Role
}

export interface AuthService {
  login(username: string, password: string): Promise<SessionUser>
  logout(): Promise<void>
  /** Sesión guardada, si existe y es válida. */
  restore(): SessionUser | null
}

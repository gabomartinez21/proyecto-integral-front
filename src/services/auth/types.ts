import type { Role } from '@/domain'

export interface SessionUser {
  id: number
  username: string
  name: string
  role: Role
}

export interface RegisterInput {
  username: string
  fullName: string
  password: string
}

export interface AuthService {
  login(username: string, password: string): Promise<SessionUser>
  register(input: RegisterInput): Promise<SessionUser>
  logout(): Promise<void>
  /** Sesión guardada, si existe y es válida (sin llamar al servidor). */
  restore(): SessionUser | null
  /** Confirma con el servidor que el token sigue vigente; devuelve el usuario actualizado. */
  verify(): Promise<SessionUser | null>
  /** Se invoca cuando el backend rechaza el token (401). */
  onSessionExpired(listener: () => void): void
}

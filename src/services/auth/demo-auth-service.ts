import { z } from 'zod/mini'
import { ROLES } from '@/domain'
import type { AuthService, SessionUser } from './types'

const SESSION_KEY = 'barbarita-demo-session'

const sessionSchema = z.object({ name: z.string(), role: z.enum(ROLES) })

/**
 * ⚠️ Solo para demostración: las credenciales viven en el cliente.
 * Reemplazar por un servicio que autentique contra un backend.
 */
const DEMO_USERS = [
  { username: 'admin', password: 'Barbarita2026!', name: 'Administración', role: 'owner' },
  { username: 'empleado', password: 'Pedidos2026!', name: 'Empleado', role: 'employee' },
] as const

export class DemoAuthService implements AuthService {
  async login(username: string, password: string): Promise<SessionUser> {
    const match = DEMO_USERS.find((u) => u.username === username && u.password === password)
    if (!match) throw new Error('Usuario o contraseña incorrectos.')
    const user: SessionUser = { name: match.name, role: match.role }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem(SESSION_KEY)
  }

  restore(): SessionUser | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const result = sessionSchema.safeParse(JSON.parse(raw))
      if (result.success) return result.data
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // Sesión corrupta o almacenamiento bloqueado: se trata como sin sesión.
    }
    return null
  }
}

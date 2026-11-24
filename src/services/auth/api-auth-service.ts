import { z } from 'zod/mini'
import { ROLES } from '@/domain'
import { ApiError, apiRequest, configureApiAuth } from '@/services/api'
import type { AuthService, RegisterInput, SessionUser } from './types'

const SESSION_KEY = 'barbarita-session'

const userOutSchema = z.object({
  id: z.number(),
  username: z.string(),
  full_name: z.string(),
  role: z.enum(ROLES),
})
type UserOut = z.infer<typeof userOutSchema>

const tokenSchema = z.object({ access_token: z.string(), role: z.enum(ROLES) })

const sessionSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    name: z.string(),
    role: z.enum(ROLES),
  }),
})
type Session = z.infer<typeof sessionSchema>

const toSessionUser = (u: UserOut): SessionUser => ({
  id: u.id,
  username: u.username,
  name: u.full_name,
  role: u.role,
})

/** Autenticación contra el backend FastAPI (JWT Bearer). La sesión vive en sessionStorage. */
export class ApiAuthService implements AuthService {
  private session: Session | null = this.readSession()
  private expiredListeners = new Set<() => void>()

  constructor() {
    configureApiAuth(
      () => this.session?.token ?? null,
      () => {
        if (!this.session) return
        this.clearSession()
        this.expiredListeners.forEach((l) => l())
      },
    )
  }

  async login(username: string, password: string): Promise<SessionUser> {
    const form = new URLSearchParams({ username: username.trim(), password })
    const token = tokenSchema.parse(
      await apiRequest('/auth/login', { method: 'POST', body: form, auth: false }),
    )
    const me = userOutSchema.parse(
      await apiRequest('/auth/me', { auth: false, token: token.access_token }),
    )
    const user = toSessionUser(me)
    this.saveSession({ token: token.access_token, user })
    return user
  }

  async register({ username, fullName, password }: RegisterInput): Promise<SessionUser> {
    await apiRequest('/auth/register', {
      method: 'POST',
      auth: false,
      body: { username: username.trim(), full_name: fullName.trim(), password },
    })
    return this.login(username, password)
  }

  async logout(): Promise<void> {
    this.clearSession()
  }

  restore(): SessionUser | null {
    return this.session?.user ?? null
  }

  async verify(): Promise<SessionUser | null> {
    if (!this.session) return null
    try {
      const user = toSessionUser(userOutSchema.parse(await apiRequest('/auth/me')))
      this.saveSession({ token: this.session.token, user })
      return user
    } catch (e) {
      // Un 401 ya limpió la sesión; ante errores de red se conserva la sesión local.
      if (e instanceof ApiError && e.status === 401) return null
      return this.session?.user ?? null
    }
  }

  onSessionExpired(listener: () => void) {
    this.expiredListeners.add(listener)
  }

  private saveSession(session: Session) {
    this.session = session
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      // Almacenamiento bloqueado: la sesión solo dura mientras la pestaña esté abierta.
    }
  }

  private clearSession() {
    this.session = null
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // ignorado
    }
  }

  private readSession(): Session | null {
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

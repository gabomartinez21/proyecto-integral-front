import { z } from 'zod/mini'
import { ROLES } from '@/domain'
import type { AuthService, SessionUser } from './types'

const SESSION_KEY = 'barbarita-demo-session'
const TOKEN_KEY = 'barbarita-token'

const sessionSchema = z.object({ name: z.string(), role: z.enum(ROLES) })

export class DemoAuthService implements AuthService {
  async login(username: string, password: string): Promise<SessionUser> {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const res = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })

    if (!res.ok) throw new Error('Usuario o contraseña incorrectos.')
    const data = await res.json()

    localStorage.setItem(TOKEN_KEY, data.access_token)

    const meRes = await fetch('http://localhost:8000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    })
    const meData = await meRes.json()

    const user: SessionUser = { name: meData.full_name, role: meData.role }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    return user
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  restore(): SessionUser | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const result = sessionSchema.safeParse(JSON.parse(raw))
      if (result.success) return result.data
      sessionStorage.removeItem(SESSION_KEY)
    } catch {}
    return null
  }
}
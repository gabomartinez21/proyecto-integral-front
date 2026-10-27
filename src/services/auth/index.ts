import { DemoAuthService } from './demo-auth-service'

export type { AuthService, SessionUser } from './types'

export const authService = new DemoAuthService()

import { ApiAuthService } from './api-auth-service'

export type { AuthService, RegisterInput, SessionUser } from './types'

export const authService = new ApiAuthService()

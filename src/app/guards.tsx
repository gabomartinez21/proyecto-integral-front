import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useCurrentUser } from '@/stores/auth.store'
import { ROUTES } from './navigation'

/** Solo deja pasar a usuarios con sesión; si no, redirige al login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useCurrentUser()
  const location = useLocation()
  if (!user) return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  return children
}

/** Evita mostrar el login a quien ya inició sesión. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const user = useCurrentUser()
  if (user) return <Navigate to={ROUTES.dashboard} replace />
  return children
}

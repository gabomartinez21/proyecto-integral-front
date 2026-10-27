import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout'
import { LoginPage } from '@/features/auth'
import { GuestOnly, RequireAuth } from './guards'
import { ROUTES } from './navigation'

// Cada página se carga bajo demanda (code splitting) para que el primer render sea rápido.
export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    path: ROUTES.dashboard,
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/features/dashboard')).DashboardPage }),
      },
      {
        path: ROUTES.orders,
        lazy: async () => ({ Component: (await import('@/features/orders')).OrdersPage }),
      },
      {
        path: ROUTES.products,
        lazy: async () => ({ Component: (await import('@/features/products')).ProductsPage }),
      },
      {
        path: ROUTES.ingredients,
        lazy: async () => ({ Component: (await import('@/features/ingredients')).IngredientsPage }),
      },
      {
        path: ROUTES.calendar,
        lazy: async () => ({ Component: (await import('@/features/calendar')).CalendarPage }),
      },
      {
        path: ROUTES.shopping,
        lazy: async () => ({ Component: (await import('@/features/shopping')).ShoppingPage }),
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.dashboard} replace /> },
])

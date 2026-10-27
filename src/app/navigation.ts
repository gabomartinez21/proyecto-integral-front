import type { IconName } from '@/components/icons/Icon'

export const ROUTES = {
  login: '/login',
  dashboard: '/',
  orders: '/pedidos',
  products: '/productos',
  ingredients: '/insumos',
  calendar: '/calendario',
  shopping: '/compras',
} as const

export interface NavItem {
  path: string
  /** Nombre corto (breadcrumb y encabezado). */
  title: string
  /** Texto en el menú lateral. */
  label: string
  icon: IconName
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: ROUTES.dashboard, title: 'Resumen', label: 'Resumen', icon: 'dashboard' },
  { path: ROUTES.orders, title: 'Pedidos', label: 'Pedidos', icon: 'orders' },
  { path: ROUTES.products, title: 'Productos', label: 'Productos y recetas', icon: 'products' },
  { path: ROUTES.ingredients, title: 'Insumos', label: 'Insumos', icon: 'ingredients' },
  { path: ROUTES.calendar, title: 'Calendario', label: 'Calendario', icon: 'calendar' },
  { path: ROUTES.shopping, title: 'Compras', label: 'Lista de compras', icon: 'shopping' },
]

import { ACTIVE_ORDER_STATUSES } from './constants'
import type { Order } from './types'

export const orderTotal = (order: Order) =>
  order.items.reduce((sum, line) => sum + line.price * line.quantity, 0)

export const orderUnits = (order: Order) =>
  order.items.reduce((sum, line) => sum + line.quantity, 0)

export const isActiveOrder = (order: Order) =>
  (ACTIVE_ORDER_STATUSES as readonly string[]).includes(order.status)

export const formatOrderNumber = (order: Order) => `#${String(order.number).padStart(3, '0')}`

/** Siguiente estado "positivo" del flujo (confirmar → entregar). */
export function nextOrderStatus(order: Order) {
  if (order.status === 'Pendiente') return 'Confirmado' as const
  if (order.status === 'Confirmado') return 'Entregado' as const
  return null
}

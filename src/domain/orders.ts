import { ACTIVE_ORDER_STATUSES } from './constants'
import type { Order } from './types'

export const orderTotal = (order: Order) =>
  order.items.reduce((sum, line) => sum + line.price * line.quantity, 0)

export const orderUnits = (order: Order) =>
  order.items.reduce((sum, line) => sum + line.quantity, 0)

export const isActiveOrder = (order: Order) =>
  (ACTIVE_ORDER_STATUSES as readonly string[]).includes(order.status)

export const formatOrderNumber = (order: Order) => `#${String(order.number).padStart(3, '0')}`

/** Siguiente estado del flujo: confirmar → preparar → listo → entregar. */
export function nextOrderStatus(order: Order) {
  switch (order.status) {
    // Con el pago ya validado (pero sin stock) se puede reintentar la confirmación.
    case 'Pendiente de pago':
      return order.paymentStatus === 'Validado' ? ('Confirmado' as const) : null
    case 'Confirmado':
      return 'En preparación' as const
    case 'En preparación':
      return 'Listo para entrega' as const
    case 'Listo para entrega':
      return 'Entregado' as const
    default:
      return null
  }
}

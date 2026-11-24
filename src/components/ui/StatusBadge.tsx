import type { OrderStatus } from '@/domain'
import { Badge, type BadgeTone } from './Badge'

const STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  'Pendiente de pago': 'warn',
  Confirmado: 'success',
  'En preparación': 'info',
  'Listo para entrega': 'info',
  Entregado: 'info',
  Cancelado: 'danger',
}

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={STATUS_TONE[status]}>{status}</Badge>
)

import { useState } from 'react'
import {
  Button,
  FormActions,
  FormError,
  ListRow,
  Modal,
  Notice,
  StatusBadge,
} from '@/components/ui'
import {
  formatOrderNumber,
  nextOrderStatus,
  orderTotal,
  type Order,
  type OrderStatus,
} from '@/domain'
import { useCommand } from '@/hooks/useCommand'
import { formatMoney, formatShortDate } from '@/lib/format'
import { useKitchenData } from '@/stores/kitchen.store'
import { OrderFormDialog } from './OrderFormDialog'

interface OrderDetailDialogProps {
  orderId: string | null
  onClose: () => void
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  Confirmado: 'Confirmar y reservar',
  Entregado: 'Marcar entregado',
}

export function OrderDetailDialog({ orderId, onClose }: OrderDetailDialogProps) {
  const { orders } = useKitchenData()
  const order = orders.find((o) => o.id === orderId)
  // Al cerrarse se desmonta el contenido, así el error de un intento previo no reaparece.
  if (!order) return null
  return <OrderDetail order={order} onClose={onClose} />
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const { run, error, pending } = useCommand()
  const [editing, setEditing] = useState(false)

  const next = nextOrderStatus(order)

  // Al confirmar, el dominio (y luego el backend) verifica el stock y lista los insumos faltantes.
  const changeStatus = async (status: OrderStatus) => {
    if (status === 'Cancelado' && !confirm('¿Cancelar este pedido y liberar sus reservas?')) return
    if (await run({ type: 'order/changeStatus', payload: { id: order.id, status } })) onClose()
  }

  if (editing) {
    return <OrderFormDialog open orderToEdit={order} onClose={() => setEditing(false)} />
  }

  return (
    <Modal open title={`Pedido ${formatOrderNumber(order)}`} onClose={onClose}>
      <h3 className="mt-4">{order.customer}</h3>
      <p className="flex items-center gap-1.5 leading-relaxed text-muted">
        {formatShortDate(order.date)} · {order.channel} · <StatusBadge status={order.status} />
      </p>
      {order.items.map((line, i) => (
        <ListRow
          key={i}
          title={
            <span className="font-normal">
              {line.quantity} × {line.name}
            </span>
          }
          aside={<strong>{formatMoney(line.price * line.quantity)}</strong>}
        />
      ))}
      <ListRow title="Total" aside={<strong>{formatMoney(orderTotal(order))}</strong>} />
      {order.notes && <Notice>{order.notes}</Notice>}

      <FormError message={error} />
      <FormActions>
        {order.status === 'Pendiente' && (
          <Button onClick={() => setEditing(true)}>Editar pedido</Button>
        )}
        {next ? (
          <>
            <Button variant="danger" disabled={pending} onClick={() => changeStatus('Cancelado')}>
              Cancelar pedido
            </Button>
            <Button variant="primary" disabled={pending} onClick={() => changeStatus(next)}>
              {NEXT_LABEL[next]}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Cerrar</Button>
        )}
      </FormActions>
    </Modal>
  )
}

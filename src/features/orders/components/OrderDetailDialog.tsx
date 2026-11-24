import { useState } from 'react'
import {
  Button,
  Field,
  FormActions,
  FormError,
  Input,
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
import { useIsOwner } from '@/stores/auth.store'
import { formatMoney, formatShortDate } from '@/lib/format'
import { useKitchenData } from '@/stores/kitchen.store'
import { OrderFormDialog } from './OrderFormDialog'
import { PaymentDialog } from './PaymentDialog'

interface OrderDetailDialogProps {
  orderId: string | null
  onClose: () => void
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  Confirmado: 'Confirmar y reservar',
  'En preparación': 'Pasar a preparación',
  'Listo para entrega': 'Marcar listo para entrega',
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
  const [paying, setPaying] = useState(false)
  const [receiver, setReceiver] = useState('')
  const isOwner = useIsOwner()

  const next = nextOrderStatus(order)

  // Al confirmar, el dominio (y luego el backend) verifica el stock y lista los insumos faltantes.
  const changeStatus = async (status: OrderStatus) => {
    if (status === 'Cancelado' && !confirm('¿Cancelar este pedido y liberar sus reservas?')) return
    const payload = {
      id: order.id,
      status,
      receiver: status === 'Entregado' ? receiver : undefined,
    }
    if (await run({ type: 'order/changeStatus', payload })) onClose()
  }

  const canCancel = order.status === 'Pendiente de pago' || order.status === 'Confirmado'
  const needsPayment = order.status === 'Pendiente de pago' && order.paymentStatus !== 'Validado'

  if (paying) {
    return (
      <PaymentDialog
        orderId={order.id}
        title={`Aprobar pago · Pedido ${formatOrderNumber(order)}`}
        onClose={() => setPaying(false)}
      />
    )
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
      <p className="mt-3 text-[13px] text-muted">
        Pago:{' '}
        {order.paymentStatus === 'Validado'
          ? `validado${order.paymentValidatedBy ? ` por ${order.paymentValidatedBy}` : ''}${
              order.operationCode ? ` · código ${order.operationCode}` : ''
            }${order.paymentProofUrl ? ' · con comprobante' : ''}`
          : 'pendiente de validación por la dueña'}
        {order.deliveryReceiver ? ` · Recibió: ${order.deliveryReceiver}` : ''}
      </p>
      {next === 'Entregado' && (
        <div className="mt-4">
          <Field label="¿Quién recibió el pedido?">
            <Input
              value={receiver}
              maxLength={150}
              placeholder="Nombre del receptor"
              onChange={(e) => setReceiver(e.target.value)}
            />
          </Field>
        </div>
      )}

      <FormError message={error} />
      <FormActions>
        {order.status === 'Pendiente de pago' && (
          <Button onClick={() => setEditing(true)}>Editar pedido</Button>
        )}
        {canCancel && (
          <Button variant="danger" disabled={pending} onClick={() => changeStatus('Cancelado')}>
            Cancelar pedido
          </Button>
        )}
        {needsPayment && (
          <Button
            variant="primary"
            disabled={!isOwner || pending}
            title={isOwner ? undefined : 'Solo la dueña puede aprobar pagos'}
            onClick={() => setPaying(true)}
          >
            Aprobar pago
          </Button>
        )}
        {next && (
          <Button variant="primary" disabled={pending} onClick={() => changeStatus(next)}>
            {NEXT_LABEL[next]}
          </Button>
        )}
        {!next && !needsPayment && !canCancel && <Button onClick={onClose}>Cerrar</Button>}
      </FormActions>
    </Modal>
  )
}

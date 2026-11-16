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
import { errorMessage } from '@/lib/errors'
import { formatMoney, formatShortDate } from '@/lib/format'
import { apiPedidosService } from '@/services/storage/api-pedidos'
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
  if (!order) return null
  return <OrderDetail order={order} onClose={onClose} />
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const { run, error, pending } = useCommand()
  const [editing, setEditing] = useState(false)
  const [stockAlert, setStockAlert] = useState<string | null>(null)

  const next = nextOrderStatus(order)

  const changeStatus = async (status: OrderStatus) => {
    setStockAlert(null)
    if (status === 'Cancelado' && !confirm('¿Cancelar este pedido y liberar sus reservas?')) return

    // HU015 y HU017: Validar stock en el backend antes de confirmar y mostrar alerta detallada si falta
    if (status === 'Confirmado') {
      try {
        await apiPedidosService.validarStock({
          customer: order.customer,
          date: order.date,
          channel: order.channel,
          notes: order.notes,
          items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        })
      } catch (e) {
        setStockAlert(errorMessage(e))
        return
      }
    }

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

      {/* HU017: Banner detallado de ingredientes faltantes */}
      {stockAlert && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#e5b8b0] bg-[#f9e9e4] p-3 text-xs font-semibold text-[#9e5a4c]"
        >
          {stockAlert}
        </div>
      )}

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
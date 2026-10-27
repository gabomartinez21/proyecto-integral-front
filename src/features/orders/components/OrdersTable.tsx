import { StatusBadge, Button, EmptyState, Table, Td, Th, Tr } from '@/components/ui'
import { formatOrderNumber, orderTotal, type Order } from '@/domain'
import { formatMoney, formatShortDate } from '@/lib/format'

interface OrdersTableProps {
  orders: Order[]
  /** Si se pasa, se muestra la columna de acciones. */
  onSelect?: (order: Order) => void
}

export function OrdersTable({ orders, onSelect }: OrdersTableProps) {
  if (!orders.length)
    return (
      <EmptyState title="Todo listo para tu primer pedido">
        Registra productos y sus recetas para empezar.
      </EmptyState>
    )

  return (
    <Table>
      <thead>
        <tr>
          <Th>Pedido / cliente</Th>
          <Th>Entrega</Th>
          <Th>Importe</Th>
          <Th>Estado</Th>
          {onSelect && <Th>Acciones</Th>}
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <Tr key={order.id}>
            <Td>
              <strong>
                {formatOrderNumber(order)} · {order.customer}
              </strong>
              <div className="text-[11px] leading-relaxed text-muted">
                {order.items.map((l) => `${l.quantity} × ${l.name}`).join(', ')}
              </div>
            </Td>
            <Td>{formatShortDate(order.date)}</Td>
            <Td>{formatMoney(orderTotal(order))}</Td>
            <Td>
              <StatusBadge status={order.status} />
            </Td>
            {onSelect && (
              <Td>
                <Button variant="link" onClick={() => onSelect(order)}>
                  Ver detalle
                </Button>
              </Td>
            )}
          </Tr>
        ))}
      </tbody>
    </Table>
  )
}

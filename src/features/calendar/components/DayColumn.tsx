import { formatOrderNumber, orderUnits, type IsoDate, type Order } from '@/domain'
import { formatWeekday } from '@/lib/format'

interface DayColumnProps {
  date: IsoDate
  orders: Order[]
  onSelect: (order: Order) => void
}

export function DayColumn({ date, orders, onSelect }: DayColumnProps) {
  return (
    <div className="min-h-[220px] rounded-[9px] border border-line bg-white p-3.5">
      <div className="mb-[18px] text-[11px] text-muted uppercase">
        {formatWeekday(date)}
        <strong className="mt-2 block text-2xl text-ink">{date.slice(-2)}</strong>
      </div>
      {orders.length ? (
        orders.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => onSelect(order)}
            className="mb-2 w-full rounded-[7px] bg-sage-100 p-2.5 text-left text-[11px] leading-normal hover:brightness-[.97]"
          >
            <strong className="block">{order.customer}</strong>
            {formatOrderNumber(order)} · {orderUnits(order)} productos
            <br />
            {order.status}
          </button>
        ))
      ) : (
        <span className="text-[11px] text-muted">Sin entregas</span>
      )}
    </div>
  )
}

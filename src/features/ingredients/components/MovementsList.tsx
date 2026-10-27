import { EmptyState, ListRow } from '@/components/ui'
import { formatDateTime, formatQuantity } from '@/lib/format'
import { useKitchenData } from '@/stores/kitchen.store'

const MAX_MOVEMENTS = 15

export function MovementsList() {
  const { movements } = useKitchenData()
  const recent = movements.slice(-MAX_MOVEMENTS).reverse()

  if (!recent.length) return <EmptyState>Los ingresos y consumos aparecerán aquí.</EmptyState>

  return recent.map((m) => (
    <ListRow
      key={m.id}
      title={m.ingredient}
      subtitle={`${m.note} · ${formatDateTime(m.date)}`}
      aside={
        <span>
          {m.quantity > 0 ? '+' : ''}
          {formatQuantity(m.quantity)} {m.unit}
        </span>
      }
    />
  ))
}

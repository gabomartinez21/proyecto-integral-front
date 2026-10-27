import { useMemo, useState } from 'react'
import { PageHeader, WeekToolbar } from '@/components/layout'
import type { IsoDate, Order } from '@/domain'
import { OrderDetailDialog } from '@/features/orders'
import { weekDays } from '@/lib/dates'
import { useKitchenData } from '@/stores/kitchen.store'
import { useWeekStore } from '@/stores/week.store'
import { DayColumn } from './components/DayColumn'

export function CalendarPage() {
  const { orders } = useKitchenData()
  const start = useWeekStore((s) => s.start)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const days = useMemo(() => weekDays(start), [start])

  const ordersByDay = useMemo(() => {
    const map = new Map<IsoDate, Order[]>()
    for (const o of orders) {
      if (o.status === 'Cancelado') continue
      map.set(o.date, [...(map.get(o.date) ?? []), o])
    }
    return map
  }, [orders])

  return (
    <>
      <PageHeader title="Calendario de entregas" subtitle="Revisa los pedidos de cada día." />
      <WeekToolbar />
      <div className="overflow-auto">
        <div className="grid min-w-[900px] grid-cols-[repeat(7,minmax(120px,1fr))] gap-2.5">
          {days.map((day) => (
            <DayColumn
              key={day}
              date={day}
              orders={ordersByDay.get(day) ?? []}
              onSelect={(o) => setSelectedId(o.id)}
            />
          ))}
        </div>
      </div>
      <OrderDetailDialog orderId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}

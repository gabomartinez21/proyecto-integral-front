import { Button } from '@/components/ui'
import { addDays, parseIso } from '@/lib/dates'
import { formatShortDate } from '@/lib/format'
import { useWeekStore } from '@/stores/week.store'

export function WeekToolbar() {
  const { start, shift } = useWeekStore()
  const end = addDays(start, 6)

  return (
    <div className="mb-[22px] flex flex-wrap items-center gap-3 print:hidden">
      <Button aria-label="Semana anterior" onClick={() => shift(-1)}>
        ←
      </Button>
      <strong>
        {formatShortDate(start)} – {formatShortDate(end)}, {parseIso(start).getUTCFullYear()}
      </strong>
      <Button aria-label="Semana siguiente" onClick={() => shift(1)}>
        →
      </Button>
    </div>
  )
}

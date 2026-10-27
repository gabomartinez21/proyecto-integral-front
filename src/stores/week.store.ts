import { create } from 'zustand'
import type { IsoDate } from '@/domain'
import { addDays, startOfWeek, todayIso } from '@/lib/dates'

/** Semana seleccionada; compartida entre Calendario y Lista de compras. */
interface WeekState {
  start: IsoDate
  shift: (weeks: number) => void
}

export const useWeekStore = create<WeekState>()((set) => ({
  start: startOfWeek(todayIso()),
  shift: (weeks) => set((s) => ({ start: addDays(s.start, weeks * 7) })),
}))

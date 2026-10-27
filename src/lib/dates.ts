import type { IsoDate } from '@/domain'

export const BUSINESS_TIME_ZONE = 'America/Lima'

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria del negocio. */
export const todayIso = (): IsoDate =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

/** Se usa mediodía UTC para que ninguna zona horaria cambie el día. */
export const parseIso = (date: IsoDate) => new Date(`${date}T12:00:00Z`)
export const toIso = (date: Date): IsoDate => date.toISOString().slice(0, 10)

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = parseIso(date)
  d.setUTCDate(d.getUTCDate() + days)
  return toIso(d)
}

/** Lunes de la semana que contiene `date`. */
export function startOfWeek(date: IsoDate): IsoDate {
  const d = parseIso(date)
  return addDays(date, -((d.getUTCDay() + 6) % 7))
}

export const weekDays = (start: IsoDate): IsoDate[] =>
  Array.from({ length: 7 }, (_, n) => addDays(start, n))

import type { IsoDate } from '@/domain'
import { BUSINESS_TIME_ZONE, parseIso } from './dates'

const LOCALE = 'es-PE'

const currency = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'PEN' })
const quantity = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 3 })

export const formatMoney = (value: number) => currency.format(value)
export const formatQuantity = (value: number) => quantity.format(value)

export const formatShortDate = (date: IsoDate) =>
  parseIso(date).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' })

export const formatWeekday = (date: IsoDate) =>
  parseIso(date).toLocaleDateString(LOCALE, { weekday: 'long' })

export const formatDateTime = (isoDateTime: string) =>
  new Date(isoDateTime).toLocaleString(LOCALE, { timeZone: BUSINESS_TIME_ZONE })

import { LIMITS } from './constants'
import { fail } from './errors'

/** Valor numérico tal como llega de un formulario. */
export type NumericInput = string | number

export function requireText(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim() || value.length > LIMITS.text)
    fail(`${label} es obligatorio (máximo ${LIMITS.text} caracteres).`)
  return value.trim()
}

export function optionalText(value: unknown, max: number = LIMITS.longText): string {
  return String(value ?? '').slice(0, max)
}

export function requireNumber(value: unknown, label: string, min = 0): number {
  const n = Number(value)
  if (
    value === '' ||
    value === null ||
    value === undefined ||
    !Number.isFinite(n) ||
    n < min ||
    n > LIMITS.maxNumber
  )
    fail(`${label} no es válido.`)
  return n
}

export function requireOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
  message: string,
): T {
  if (!options.includes(value as T)) fail(message)
  return value as T
}

export function isValidIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  )
}

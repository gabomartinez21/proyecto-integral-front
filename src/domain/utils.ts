/** Redondea a 6 decimales para evitar errores de coma flotante en cantidades. */
export const round = (n: number) => Math.round(n * 1_000_000) / 1_000_000

export function createId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (x) =>
    x.toString(16).padStart(2, '0'),
  ).join('')
}

export function addQuantity(map: Record<string, number>, key: string, value: number) {
  map[key] = round((map[key] ?? 0) + value)
}

import { z } from 'zod/mini'
import type { KitchenSnapshot } from './kitchen-repository'

const records = z.array(z.record(z.string(), z.unknown()))

export const snapshotSchema = z.object({
  data: z.object({
    products: records,
    ingredients: records,
    orders: records,
    movements: records,
  }),
  revision: z.int().check(z.nonnegative()),
})

export function parseSnapshot(value: unknown): KitchenSnapshot {
  const result = snapshotSchema.safeParse(value)
  if (!result.success) throw new Error('Los datos guardados no son válidos. No se han sobrescrito.')
  return result.data as unknown as KitchenSnapshot
}

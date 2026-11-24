import { LIMITS, UNITS } from '../constants'
import { fail } from '../errors'
import { createId } from '../utils'
import { requireNumber, requireOneOf, requireText } from '../validators'
import type { CommandHandler } from './types'

export const createIngredient: CommandHandler<'ingredient/create'> = (draft, p) => {
  const name = requireText(p.name, 'El nombre', 2)
  if (draft.ingredients.some((x) => x.name.toLowerCase() === name.toLowerCase()))
    fail('El insumo ya existe.')

  draft.ingredients.push({
    id: createId(),
    name,
    unit: requireOneOf(p.unit, UNITS, 'Unidad inválida.'),
    stock: requireNumber(p.stock, 'El stock'),
    minimum: requireNumber(p.minimum, 'El mínimo'),
    cost: requireNumber(p.cost, 'El costo unitario', LIMITS.minPositive),
  })
}

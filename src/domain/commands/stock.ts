import { LIMITS, STOCK_MOVEMENT_KINDS } from '../constants'
import { fail } from '../errors'
import { reservedQuantities } from '../inventory'
import { createId, round } from '../utils'
import { requireNumber, requireOneOf, requireText } from '../validators'
import type { CommandHandler } from './types'

export const moveStock: CommandHandler<'stock/move'> = (draft, p) => {
  const ingredient = draft.ingredients.find((x) => x.id === p.id)
  if (!ingredient) fail('Insumo inexistente.')

  const quantity = requireNumber(p.quantity, 'La cantidad', LIMITS.minPositive)
  const kind = requireOneOf(p.kind, STOCK_MOVEMENT_KINDS, 'Movimiento inválido.')
  const delta = kind === 'entrada' ? quantity : -quantity

  if (ingredient.stock + delta < (reservedQuantities(draft)[ingredient.id] ?? 0))
    fail('No puedes retirar stock reservado para pedidos.')

  ingredient.stock = round(ingredient.stock + delta)
  draft.movements.push({
    id: createId(),
    date: new Date().toISOString(),
    ingredient: ingredient.name,
    quantity: delta,
    unit: ingredient.unit,
    note: requireText(p.note, 'El motivo'),
  })
}

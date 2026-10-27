import { LIMITS } from '../constants'
import { fail } from '../errors'
import { requireNumber } from '../validators'
import type { CommandHandler } from './types'

export const saveRecipe: CommandHandler<'recipe/save'> = (draft, p) => {
  const product = draft.products.find((x) => x.id === p.id)
  if (!product) fail('Producto inexistente.')
  if (!Array.isArray(p.recipe)) fail('Receta inválida.')

  const seen = new Set<string>()
  product.recipe = p.recipe.map((line) => {
    if (!draft.ingredients.some((i) => i.id === line.ingredientId))
      fail('Primero debes registrar el insumo.')
    if (seen.has(line.ingredientId)) fail('No repitas un ingrediente.')
    seen.add(line.ingredientId)
    return {
      ingredientId: line.ingredientId,
      quantity: requireNumber(line.quantity, 'La cantidad', LIMITS.minPositive),
    }
  })
}

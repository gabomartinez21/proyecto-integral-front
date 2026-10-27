import { PRODUCT_CATEGORIES } from '../constants'
import { fail } from '../errors'
import { createId } from '../utils'
import { optionalText, requireNumber, requireOneOf, requireText } from '../validators'
import type { CommandHandler } from './types'

export const saveProduct: CommandHandler<'product/save'> = (draft, p) => {
  const name = requireText(p.name, 'El nombre')
  const duplicated = draft.products.some(
    (x) => x.name.toLocaleLowerCase() === name.toLocaleLowerCase() && x.id !== p.id,
  )
  if (duplicated) fail('Ya existe un producto con ese nombre.')

  const record = {
    id: p.id || createId(),
    name,
    category: requireOneOf(p.category, PRODUCT_CATEGORIES, 'Categoría inválida.'),
    price: requireNumber(p.price, 'El precio'),
    description: optionalText(p.description),
  }

  const existing = p.id ? draft.products.find((x) => x.id === p.id) : undefined
  if (p.id && !existing) fail('Producto inexistente.')
  if (existing) Object.assign(existing, record)
  else draft.products.push({ ...record, recipe: [] })
}

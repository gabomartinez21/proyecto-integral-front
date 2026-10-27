import { DEMO_INGREDIENTS, DEMO_PRODUCTS } from '../demo-data'
import { fail } from '../errors'
import type { CommandHandler } from './types'

export const loadDemo: CommandHandler<'demo/load'> = (draft) => {
  if (draft.products.length || draft.ingredients.length || draft.orders.length)
    fail('Los ejemplos solo se cargan en una base vacía.')
  draft.ingredients = structuredClone(DEMO_INGREDIENTS)
  draft.products = structuredClone(DEMO_PRODUCTS)
}

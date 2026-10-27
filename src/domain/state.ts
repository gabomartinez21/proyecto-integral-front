import type { KitchenState } from './types'

export const createInitialState = (): KitchenState => ({
  products: [],
  ingredients: [],
  orders: [],
  movements: [],
})

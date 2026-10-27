import type { KitchenState } from '../types'
import type { NumericInput } from '../validators'

export interface ProductInput {
  id?: string
  name: string
  category: string
  price: NumericInput
  description?: string
}

export interface IngredientInput {
  name: string
  unit: string
  stock: NumericInput
  minimum: NumericInput
  cost: NumericInput
}

export interface StockMovementInput {
  id: string
  kind: string
  quantity: NumericInput
  note: string
}

export interface RecipeInput {
  id: string
  recipe: { ingredientId: string; quantity: NumericInput }[]
}

export interface OrderInput {
  customer: string
  date: string
  channel: string
  notes?: string
  items: { productId: string; quantity: NumericInput }[]
}

export interface OrderStatusInput {
  id: string
  status: string
}

/** Todas las operaciones que modifican el estado de la cocina. */
export type KitchenCommand =
  | { type: 'product/save'; payload: ProductInput }
  | { type: 'ingredient/create'; payload: IngredientInput }
  | { type: 'stock/move'; payload: StockMovementInput }
  | { type: 'recipe/save'; payload: RecipeInput }
  | { type: 'order/create'; payload: OrderInput }
  | { type: 'order/changeStatus'; payload: OrderStatusInput }
  | { type: 'demo/load'; payload?: undefined }

export type CommandType = KitchenCommand['type']

/** Un handler recibe una copia del estado y la modifica directamente. */
export type CommandHandler<T extends CommandType> = (
  draft: KitchenState,
  payload: Extract<KitchenCommand, { type: T }>['payload'],
) => void

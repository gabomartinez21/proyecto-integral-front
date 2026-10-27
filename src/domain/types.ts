import type {
  ORDER_CHANNELS,
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  ROLES,
  STOCK_MOVEMENT_KINDS,
  UNITS,
} from './constants'

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
export type Unit = (typeof UNITS)[number]
export type OrderChannel = (typeof ORDER_CHANNELS)[number]
export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type StockMovementKind = (typeof STOCK_MOVEMENT_KINDS)[number]
export type Role = (typeof ROLES)[number]

/** Fecha en formato ISO `YYYY-MM-DD`. */
export type IsoDate = string
/** Mapa ingrediente → cantidad. */
export type QuantityMap = Record<string, number>

export interface RecipeLine {
  ingredientId: string
  quantity: number
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  description: string
  recipe: RecipeLine[]
}

export interface Ingredient {
  id: string
  name: string
  unit: Unit
  stock: number
  minimum: number
  cost: number
}

/** Línea de pedido: guarda una copia del precio y la receta al momento del pedido. */
export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  recipe: RecipeLine[]
}

export interface Order {
  id: string
  number: number
  customer: string
  date: IsoDate
  channel: OrderChannel
  notes: string
  items: OrderItem[]
  status: OrderStatus
  created: string
}

export interface StockMovement {
  id: string
  date: string
  ingredient: string
  quantity: number
  unit: Unit
  note: string
}

export interface KitchenState {
  products: Product[]
  ingredients: Ingredient[]
  orders: Order[]
  movements: StockMovement[]
}

export interface ShoppingItem extends Ingredient {
  required: number
  available: number
  buy: number
}

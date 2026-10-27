import { ACTIVE_ORDER_STATUSES } from './constants'
import type { Ingredient, KitchenState, Order, QuantityMap, ShoppingItem } from './types'
import { addQuantity, round } from './utils'

/** Ingredientes totales que consume un pedido. */
export function orderNeeds(order: Order): QuantityMap {
  const result: QuantityMap = {}
  for (const line of order.items)
    for (const r of line.recipe) addQuantity(result, r.ingredientId, r.quantity * line.quantity)
  return result
}

function sumNeeds(orders: Order[]): QuantityMap {
  const result: QuantityMap = {}
  for (const o of orders)
    for (const [k, v] of Object.entries(orderNeeds(o))) addQuantity(result, k, v)
  return result
}

/** Cantidades apartadas por pedidos confirmados (opcionalmente excluyendo uno). */
export function reservedQuantities(state: KitchenState, exceptOrderId?: string): QuantityMap {
  return sumNeeds(state.orders.filter((o) => o.status === 'Confirmado' && o.id !== exceptOrderId))
}

export function availableStock(ingredient: Ingredient, reserved: QuantityMap): number {
  return round(ingredient.stock - (reserved[ingredient.id] ?? 0))
}

export function isLowStock(ingredient: Ingredient, reserved: QuantityMap): boolean {
  return availableStock(ingredient, reserved) <= ingredient.minimum
}

export function lowStockIngredients(state: KitchenState): Ingredient[] {
  const reserved = reservedQuantities(state)
  return state.ingredients.filter((i) => isLowStock(i, reserved))
}

/**
 * Lista de compras para los pedidos activos entre `from` y `to` (inclusive).
 * El stock disponible descuenta lo reservado por pedidos confirmados fuera del rango.
 */
export function shoppingList(state: KitchenState, from = '', to = '9999'): ShoppingItem[] {
  const inRange = (o: Order) => o.date >= from && o.date <= to
  const required = sumNeeds(
    state.orders.filter(
      (o) => (ACTIVE_ORDER_STATUSES as readonly string[]).includes(o.status) && inRange(o),
    ),
  )
  const reservedOutside = sumNeeds(
    state.orders.filter((o) => o.status === 'Confirmado' && !inRange(o)),
  )

  return state.ingredients
    .filter((i) => required[i.id])
    .map((i) => {
      const needed = required[i.id] ?? 0
      const available = round(Math.max(0, i.stock - (reservedOutside[i.id] ?? 0)))
      return { ...i, required: needed, available, buy: round(Math.max(0, needed - available)) }
    })
}

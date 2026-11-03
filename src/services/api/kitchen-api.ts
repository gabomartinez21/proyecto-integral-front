import { z } from 'zod/mini'
import { ORDER_CHANNELS, ORDER_STATUSES, UNITS } from '@/domain'
import type { Ingredient, Order, StockMovement, StockMovementKind } from '@/domain'
import { apiRequest } from './client'

/*
 * Endpoints de insumos y pedidos del backend. Los ids numéricos se convierten a
 * string para encajar con los tipos del dominio.
 */

const insumoSchema = z.object({
  id: z.number(),
  name: z.string(),
  unit: z.enum(UNITS),
  stock: z.number(),
  minimum: z.number(),
  cost: z.number(),
})

const movimientoSchema = z.object({
  id: z.number(),
  ingredient: z.string(),
  quantity: z.number(),
  unit: z.enum(UNITS),
  note: z.string(),
  date: z.string(),
})

const pedidoSchema = z.object({
  id: z.string(),
  number: z.number(),
  customer: z.string(),
  date: z.string(),
  // El backend acepta cualquier texto; si llega algo desconocido se muestra igual.
  channel: z.string(),
  notes: z.string(),
  status: z.string(),
  created: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
    }),
  ),
})

const toIngredient = (i: z.infer<typeof insumoSchema>): Ingredient => ({ ...i, id: String(i.id) })

const toMovement = (m: z.infer<typeof movimientoSchema>): StockMovement => ({
  ...m,
  id: String(m.id),
})

/** Pedido tal como lo guarda el backend: las líneas aún no tienen precio ni receta. */
export type RemoteOrder = z.infer<typeof pedidoSchema>

/** Completa las líneas del pedido con los productos (que siguen guardándose en el navegador). */
export function hydrateOrder(
  order: RemoteOrder,
  products: readonly {
    id: string
    name: string
    price: number
    recipe: Order['items'][number]['recipe']
  }[],
): Order {
  return {
    ...order,
    channel: (ORDER_CHANNELS as readonly string[]).includes(order.channel)
      ? (order.channel as Order['channel'])
      : 'Directo',
    status: (ORDER_STATUSES as readonly string[]).includes(order.status)
      ? (order.status as Order['status'])
      : 'Pendiente',
    items: order.items.map((line) => {
      const product = products.find((p) => p.id === line.productId)
      return {
        productId: line.productId,
        quantity: line.quantity,
        name: product?.name ?? 'Producto eliminado',
        price: product?.price ?? line.price,
        recipe: product ? structuredClone(product.recipe) : [],
      }
    }),
  }
}

export interface RemoteKitchen {
  ingredients: Ingredient[]
  movements: StockMovement[]
  orders: RemoteOrder[]
}

/** Lee insumos, movimientos y pedidos. El backend los devuelve del más nuevo al más antiguo. */
export async function fetchRemoteKitchen(): Promise<RemoteKitchen> {
  const [insumos, movimientos, pedidos] = await Promise.all([
    apiRequest<unknown>('/insumos'),
    apiRequest<unknown>('/insumos/movimientos'),
    apiRequest<unknown>('/pedidos'),
  ])
  return {
    ingredients: z.array(insumoSchema).parse(insumos).map(toIngredient),
    // El dominio los espera en orden cronológico (del más antiguo al más nuevo).
    movements: z.array(movimientoSchema).parse(movimientos).map(toMovement).reverse(),
    orders: z.array(pedidoSchema).parse(pedidos).reverse(),
  }
}

export interface NewIngredient {
  name: string
  unit: Ingredient['unit']
  minimum: number
  cost: number
}

export async function createIngredient({
  name,
  unit,
  minimum,
  cost,
}: NewIngredient): Promise<Ingredient> {
  const body = { name, unit, minimum, cost }
  return toIngredient(insumoSchema.parse(await apiRequest('/insumos', { method: 'POST', body })))
}

export async function moveStock(
  ingredientId: string,
  movement: { kind: StockMovementKind; quantity: number; note: string },
): Promise<void> {
  await apiRequest(`/insumos/${encodeURIComponent(ingredientId)}/stock`, {
    method: 'POST',
    body: movement,
  })
}

export interface NewOrder {
  customer: string
  date: string
  channel: string
  notes: string
  items: { productId: string; quantity: number }[]
}

export async function createOrder(input: NewOrder): Promise<void> {
  await apiRequest('/pedidos', { method: 'POST', body: input })
}

export async function changeOrderStatus(orderId: string, status: string): Promise<void> {
  await apiRequest(`/pedidos/${encodeURIComponent(orderId)}/estado`, {
    method: 'PUT',
    body: { status },
  })
}

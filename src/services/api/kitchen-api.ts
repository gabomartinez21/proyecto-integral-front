import { z } from 'zod/mini'
import { ORDER_CHANNELS, ORDER_STATUSES, PRODUCT_CATEGORIES, UNITS } from '@/domain'
import type {
  Ingredient,
  KitchenState,
  Order,
  Product,
  ProductCategory,
  RecipeLine,
  StockMovement,
  StockMovementKind,
} from '@/domain'
import { apiRequest } from './client'

/*
 * Endpoints de productos, insumos y pedidos del backend. Los ids numéricos se
 * convierten a string para encajar con los tipos del dominio, y de vuelta a
 * número al enviarlos.
 */

const id = z.union([z.number(), z.string()])
const toId = (value: number | string) => String(value)
const toNumericId = (value: string) => Number(value)

const recipeLineSchema = z.object({ ingredientId: id, quantity: z.number() })

const productoSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number(),
  description: z.string(),
  recipe: z.array(recipeLineSchema),
})

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
  id: id,
  number: z.number(),
  customer: z.string(),
  date: z.string(),
  channel: z.enum(ORDER_CHANNELS),
  notes: z.string(),
  status: z.enum(ORDER_STATUSES),
  created: z.string(),
  items: z.array(
    z.object({
      productId: id,
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      recipe: z.array(recipeLineSchema),
    }),
  ),
})

const toRecipe = (recipe: z.infer<typeof recipeLineSchema>[]): RecipeLine[] =>
  recipe.map((r) => ({ ingredientId: toId(r.ingredientId), quantity: r.quantity }))

const toProduct = (p: z.infer<typeof productoSchema>): Product => ({
  ...p,
  id: toId(p.id),
  recipe: toRecipe(p.recipe),
})

const toIngredient = (i: z.infer<typeof insumoSchema>): Ingredient => ({ ...i, id: toId(i.id) })

const toMovement = (m: z.infer<typeof movimientoSchema>): StockMovement => ({
  ...m,
  id: toId(m.id),
})

const toOrder = (o: z.infer<typeof pedidoSchema>): Order => ({
  ...o,
  id: toId(o.id),
  items: o.items.map((line) => ({
    ...line,
    productId: toId(line.productId),
    recipe: toRecipe(line.recipe),
  })),
})

/** Lee todo el estado de la cocina desde el backend. */
export async function fetchKitchen(): Promise<KitchenState> {
  const [productos, insumos, movimientos, pedidos] = await Promise.all([
    apiRequest<unknown>('/productos'),
    apiRequest<unknown>('/insumos'),
    apiRequest<unknown>('/insumos/movimientos'),
    apiRequest<unknown>('/pedidos'),
  ])
  return {
    products: z.array(productoSchema).parse(productos).map(toProduct),
    ingredients: z.array(insumoSchema).parse(insumos).map(toIngredient),
    // El backend devuelve movimientos y pedidos del más nuevo al más antiguo;
    // el dominio los espera en orden cronológico.
    movements: z.array(movimientoSchema).parse(movimientos).map(toMovement).reverse(),
    orders: z.array(pedidoSchema).parse(pedidos).map(toOrder).reverse(),
  }
}

// --- Productos y recetas ---

export interface ProductFields {
  name: string
  category: ProductCategory
  price: number
  description: string
}

export async function saveProduct(
  { name, category, price, description }: ProductFields,
  productId?: string,
): Promise<Product> {
  const body = { name, category, price, description }
  const response = productId
    ? await apiRequest(`/productos/${toNumericId(productId)}`, { method: 'PUT', body })
    : await apiRequest('/productos', { method: 'POST', body })
  return toProduct(productoSchema.parse(response))
}

export async function saveRecipe(productId: string, recipe: RecipeLine[]): Promise<void> {
  await apiRequest(`/productos/${toNumericId(productId)}/receta`, {
    method: 'PUT',
    body: {
      recipe: recipe.map((r) => ({
        ingredientId: toNumericId(r.ingredientId),
        quantity: r.quantity,
      })),
    },
  })
}

// --- Insumos y stock ---

export interface IngredientFields {
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
}: IngredientFields): Promise<Ingredient> {
  const body = { name, unit, minimum, cost }
  return toIngredient(insumoSchema.parse(await apiRequest('/insumos', { method: 'POST', body })))
}

export async function moveStock(
  ingredientId: string,
  movement: { kind: StockMovementKind; quantity: number; note: string },
): Promise<void> {
  await apiRequest(`/insumos/${toNumericId(ingredientId)}/stock`, {
    method: 'POST',
    body: movement,
  })
}

// --- Pedidos ---

export interface OrderFields {
  customer: string
  date: string
  channel: string
  notes: string
  items: { productId: string; quantity: number }[]
}

export async function createOrder(input: OrderFields): Promise<void> {
  await apiRequest('/pedidos', {
    method: 'POST',
    body: {
      ...input,
      items: input.items.map((i) => ({
        productId: toNumericId(i.productId),
        quantity: i.quantity,
      })),
    },
  })
}

/** El backend valida la transición, verifica stock al confirmar y lo descuenta al entregar. */
export async function changeOrderStatus(orderId: string, status: string): Promise<void> {
  await apiRequest(`/pedidos/${toNumericId(orderId)}/estado`, {
    method: 'PUT',
    body: { status },
  })
}

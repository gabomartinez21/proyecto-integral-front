import { z } from 'zod/mini'
import { ORDER_CHANNELS, ORDER_STATUSES, PRODUCT_CATEGORIES, UNITS } from '@/domain'
import type {
  Ingredient,
  KitchenState,
  Order,
  Product,
  ProductCategory,
  RecipeLine,
  ShoppingItem,
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
  paymentStatus: z.optional(z.enum(['Pendiente', 'Validado'])),
  operationCode: z.optional(z.nullable(z.string())),
  paymentProofUrl: z.optional(z.nullable(z.string())),
  paymentValidatedBy: z.optional(z.nullable(z.string())),
  deliveryReceiver: z.optional(z.nullable(z.string())),
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

const toOrderBody = (input: OrderFields) => ({
  ...input,
  items: input.items.map((i) => ({ productId: toNumericId(i.productId), quantity: i.quantity })),
})

export async function createOrder(input: OrderFields): Promise<void> {
  await apiRequest('/pedidos', { method: 'POST', body: toOrderBody(input) })
}

/** El backend solo permite editar pedidos pendientes. */
export async function updateOrder(orderId: string, input: OrderFields): Promise<void> {
  await apiRequest(`/pedidos/${toNumericId(orderId)}`, { method: 'PUT', body: toOrderBody(input) })
}

/** El backend valida la transición, verifica stock al confirmar y lo descuenta al entregar. */
export async function changeOrderStatus(
  orderId: string,
  status: string,
  receiver?: string,
): Promise<void> {
  await apiRequest(`/pedidos/${toNumericId(orderId)}/estado`, {
    method: 'PUT',
    body: { status, receiver },
  })
}

/** HU024: solo la dueña. Comprobante JPG/PNG (máx. 5 MB) o código de operación. */
export async function validateOrderPayment(
  orderId: string,
  input: { code?: string; proof?: File | null },
): Promise<void> {
  const form = new FormData()
  if (input.code?.trim()) form.append('codigo_operacion', input.code.trim())
  if (input.proof) form.append('comprobante', input.proof)
  await apiRequest(`/pedidos/${toNumericId(orderId)}/validar-pago`, { method: 'PATCH', body: form })
}

// --- Compras (HU021, HU022, HU023) ---

const compraItemSchema = z.object({
  id: id,
  name: z.string(),
  unit: z.enum(UNITS),
  stock: z.number(),
  minimum: z.number(),
  cost: z.number(),
  required: z.number(),
  available: z.number(),
  buy: z.number(),
  estimatedCost: z.number(),
})

const listaSemanalSchema = z.object({
  mensaje: z.string(),
  presupuesto_estimado: z.number(),
  items: z.array(compraItemSchema),
})

export interface ShoppingListResult {
  items: ShoppingItem[]
  budget: number
  message: string
}

/** HU021/HU022: lista semanal calculada por el backend (demanda − cobertura, sin doble reserva). */
export async function fetchShoppingList(from: string, to: string): Promise<ShoppingListResult> {
  const query = new URLSearchParams({ fecha_inicio: from, fecha_fin: to })
  const data = listaSemanalSchema.parse(await apiRequest(`/compras/lista-semanal?${query}`))
  return {
    budget: data.presupuesto_estimado,
    message: data.mensaje,
    items: data.items.map((item) => ({
      id: toId(item.id),
      name: item.name,
      unit: item.unit,
      stock: item.stock,
      minimum: item.minimum,
      cost: item.cost,
      required: item.required,
      available: item.available,
      buy: item.buy,
    })),
  }
}

/** HU023: ingreso rápido de un insumo comprado (solo la dueña); suma al almacén de forma atómica. */
export async function confirmPurchase(ingredientId: string, quantity: number): Promise<void> {
  await apiRequest('/compras/confirmar-item', {
    method: 'POST',
    body: { insumo_id: toNumericId(ingredientId), quantity },
  })
}

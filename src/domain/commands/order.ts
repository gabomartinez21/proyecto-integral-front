import { ORDER_CHANNELS, ORDER_TRANSITIONS } from '../constants'
import { fail } from '../errors'
import { orderNeeds, reservedQuantities } from '../inventory'
import { createId, round } from '../utils'
import {
  isValidIsoDate,
  optionalText,
  requireNumber,
  requireOneOf,
  requireText,
} from '../validators'
import type { CommandHandler } from './types'

export const createOrder: CommandHandler<'order/create'> = (draft, p) => {
  const customer = requireText(p.customer, 'El cliente', 3)
  if (!isValidIsoDate(p.date)) fail('La fecha no es válida.')
  const channel = requireOneOf(p.channel, ORDER_CHANNELS, 'Canal inválido.')
  if (!Array.isArray(p.items) || !p.items.length) fail('Agrega al menos un producto.')

  const items = p.items.map((line) => {
    const product = draft.products.find((x) => x.id === line.productId)
    if (!product || !product.recipe.length) fail('Cada producto debe tener una receta definida.')
    const quantity = requireNumber(line.quantity, 'La cantidad', 1)
    if (!Number.isInteger(quantity)) fail('La cantidad de productos debe ser entera.')
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      // Se copia la receta: los pedidos existentes no cambian si luego se edita.
      recipe: structuredClone(product.recipe),
    }
  })

  draft.orders.push({
    id: createId(),
    number: draft.orders.length + 1,
    customer,
    date: p.date,
    channel,
    notes: optionalText(p.notes),
    items,
    status: 'Pendiente',
    created: new Date().toISOString(),
  })
}

export const changeOrderStatus: CommandHandler<'order/changeStatus'> = (draft, p) => {
  const order = draft.orders.find((x) => x.id === p.id)
  if (!order) fail('Pedido inexistente.')
  if (!ORDER_TRANSITIONS[order.status]?.includes(p.status)) fail('Cambio de estado no permitido.')
  const needs = orderNeeds(order)

  if (p.status === 'Confirmado') {
    const reserved = reservedQuantities(draft, order.id)
    for (const [ingredientId, quantity] of Object.entries(needs)) {
      const ingredient = draft.ingredients.find((i) => i.id === ingredientId)
      if (!ingredient || round(ingredient.stock - (reserved[ingredientId] ?? 0)) < quantity)
        fail(`Stock insuficiente: ${ingredient?.name ?? 'insumo'}. Revisa la lista de compras.`)
    }
  }

  if (p.status === 'Entregado') {
    for (const [ingredientId, quantity] of Object.entries(needs)) {
      const ingredient = draft.ingredients.find((i) => i.id === ingredientId)
      if (!ingredient || ingredient.stock < quantity) fail('Stock insuficiente.')
      ingredient.stock = round(ingredient.stock - quantity)
      draft.movements.push({
        id: createId(),
        date: new Date().toISOString(),
        ingredient: ingredient.name,
        quantity: -quantity,
        unit: ingredient.unit,
        note: `Entrega de pedido #${order.number}`,
      })
    }
  }

  order.status = p.status as typeof order.status
}

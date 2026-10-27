import { fail } from '../errors'
import type { KitchenState, Role } from '../types'
import { loadDemo } from './demo'
import { createIngredient } from './ingredient'
import { changeOrderStatus, createOrder } from './order'
import { saveProduct } from './product'
import { saveRecipe } from './recipe'
import { moveStock } from './stock'
import type { CommandHandler, CommandType, KitchenCommand } from './types'

export type * from './types'

const handlers: { [K in CommandType]: CommandHandler<K> } = {
  'product/save': saveProduct,
  'ingredient/create': createIngredient,
  'stock/move': moveStock,
  'recipe/save': saveRecipe,
  'order/create': createOrder,
  'order/changeStatus': changeOrderStatus,
  'demo/load': loadDemo,
}

/** Comandos que un empleado puede ejecutar; el resto requiere rol de dueño. */
const EMPLOYEE_COMMANDS: ReadonlySet<CommandType> = new Set(['order/create', 'order/changeStatus'])

export function canExecute(role: Role, type: CommandType): boolean {
  return role === 'owner' || EMPLOYEE_COMMANDS.has(type)
}

/**
 * Aplica un comando de forma inmutable: devuelve un estado nuevo o lanza
 * `DomainError` si alguna regla de negocio no se cumple.
 */
export function applyCommand(
  state: KitchenState,
  command: KitchenCommand,
  role: Role = 'owner',
): KitchenState {
  if (!canExecute(role, command.type)) fail('Requiere permisos de dueño.')
  const draft = structuredClone(state)
  const handler = handlers[command.type] as CommandHandler<typeof command.type>
  handler(draft, command.payload as never)
  return draft
}

export const PRODUCT_CATEGORIES = ['Viandas', 'Postres', 'Eventos', 'Otros'] as const
export const UNITS = ['kg', 'L', 'unidad'] as const
export const ORDER_CHANNELS = ['WhatsApp', 'Instagram', 'Directo'] as const
export const ORDER_STATUSES = ['Pendiente', 'Confirmado', 'Entregado', 'Cancelado'] as const
export const STOCK_MOVEMENT_KINDS = ['entrada', 'salida'] as const
export const ROLES = ['owner', 'employee'] as const

/** Estados en los que un pedido sigue "en curso" (por preparar o entregar). */
export const ACTIVE_ORDER_STATUSES = ['Pendiente', 'Confirmado'] as const

/** Máquina de estados de un pedido: desde cada estado, a cuáles se puede pasar. */
export const ORDER_TRANSITIONS: Readonly<Record<string, readonly string[]>> = {
  Pendiente: ['Confirmado', 'Cancelado'],
  Confirmado: ['Entregado', 'Cancelado'],
}

export const LIMITS = {
  text: 150,
  longText: 500,
  maxNumber: 1e9,
  minPositive: 0.000001,
} as const

import type { KitchenState } from '@/domain'

export interface KitchenSnapshot {
  data: KitchenState
  /** Se incrementa en cada escritura; sirve para detectar cambios concurrentes. */
  revision: number
}

/**
 * Contrato de persistencia. Hoy se implementa con localStorage; para pasar a
 * un backend basta con crear otra implementación (p. ej. `ApiKitchenRepository`).
 */
export interface KitchenRepository {
  read(): Promise<KitchenSnapshot>
  write(snapshot: KitchenSnapshot): Promise<void>
}

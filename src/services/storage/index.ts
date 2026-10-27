import { LocalStorageKitchenRepository } from './local-storage-repository'

export type { KitchenRepository, KitchenSnapshot } from './kitchen-repository'

/** Implementación activa. Cambiar aquí para usar otra fuente de datos. */
export const kitchenRepository = new LocalStorageKitchenRepository()

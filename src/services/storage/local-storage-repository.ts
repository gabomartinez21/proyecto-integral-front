import { createInitialState } from '@/domain'
import type { KitchenRepository, KitchenSnapshot } from './kitchen-repository'
import { parseSnapshot } from './snapshot-schema'

/** Misma clave que la versión vanilla, para conservar los datos existentes. */
const STORAGE_KEY = 'barbarita-html-v1'

export class LocalStorageKitchenRepository implements KitchenRepository {
  constructor(private readonly key = STORAGE_KEY) {}

  async read(): Promise<KitchenSnapshot> {
    const raw = localStorage.getItem(this.key)
    if (!raw) return { data: createInitialState(), revision: 0 }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('Los datos guardados no son válidos. No se han sobrescrito.')
    }
    return parseSnapshot(parsed)
  }

  async write(snapshot: KitchenSnapshot): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(snapshot))
  }
}

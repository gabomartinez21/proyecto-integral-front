import { useCallback, useState } from 'react'
import type { KitchenCommand } from '@/domain'
import { errorMessage } from '@/lib/errors'
import { useKitchenStore } from '@/stores/kitchen.store'
import { toast } from '@/stores/toast.store'

/**
 * Ejecuta comandos de dominio desde la UI: expone el error para mostrarlo en
 * el formulario y avisa al usuario cuando se guarda correctamente.
 */
export function useCommand() {
  const dispatch = useKitchenStore((s) => s.dispatch)
  const pending = useKitchenStore((s) => s.busy)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(
    async (command: KitchenCommand, successMessage = 'Guardado correctamente') => {
      setError(null)
      try {
        await dispatch(command)
        toast(successMessage)
        return true
      } catch (e) {
        setError(errorMessage(e))
        return false
      }
    },
    [dispatch],
  )

  return { run, error, pending, clearError: () => setError(null) }
}

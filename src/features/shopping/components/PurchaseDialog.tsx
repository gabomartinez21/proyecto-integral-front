import { useState } from 'react'
import { Button, Field, FormActions, FormError, Input, Modal } from '@/components/ui'
import type { ShoppingItem } from '@/domain'
import { errorMessage } from '@/lib/errors'
import { useKitchenStore } from '@/stores/kitchen.store'
import { toast } from '@/stores/toast.store'

interface PurchaseDialogProps {
  item: ShoppingItem | null
  onClose: () => void
}

/** Registra una compra de la lista semanal como entrada de stock (HU023). */
export function PurchaseDialog({ item, onClose }: PurchaseDialogProps) {
  return (
    <Modal open={Boolean(item)} title={`Confirmar compra · ${item?.name ?? ''}`} onClose={onClose}>
      {/* Se monta de nuevo por insumo para reiniciar la cantidad sugerida y el error. */}
      {item && <PurchaseForm key={item.id} item={item} onDone={onClose} />}
    </Modal>
  )
}

function PurchaseForm({ item, onDone }: { item: ShoppingItem; onDone: () => void }) {
  const confirmPurchase = useKitchenStore((s) => s.confirmPurchase)
  const pending = useKitchenStore((s) => s.busy)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(String(item.buy))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(quantity)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('La cantidad adquirida debe ser mayor que cero.')
      return
    }
    setError(null)
    try {
      await confirmPurchase(item.id, amount)
      toast(`Ingreso registrado: +${quantity} ${item.unit} de ${item.name}`)
      onDone()
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <form className="mt-4" onSubmit={(e) => void onSubmit(e)}>
      <Field label={`Cantidad adquirida (${item.unit}) *`}>
        <Input
          type="number"
          required
          min={0.001}
          step={0.001}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </Field>
      <FormError message={error} />
      <FormActions>
        <Button onClick={onDone}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={pending}>
          Confirmar e ingresar a almacén
        </Button>
      </FormActions>
    </form>
  )
}

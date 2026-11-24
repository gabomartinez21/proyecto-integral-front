import { useState } from 'react'
import { Button, Field, FormActions, FormError, Input, Modal, Notice } from '@/components/ui'
import { errorMessage } from '@/lib/errors'
import { useKitchenStore } from '@/stores/kitchen.store'
import { toast } from '@/stores/toast.store'

const MAX_PROOF_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

interface PaymentDialogProps {
  orderId: string
  title: string
  onClose: () => void
}

/** HU024: la dueña aprueba el pago con comprobante (JPG/PNG, máx. 5 MB) o código de operación. */
export function PaymentDialog({ orderId, title, onClose }: PaymentDialogProps) {
  const validatePayment = useKitchenStore((s) => s.validatePayment)
  const pending = useKitchenStore((s) => s.busy)
  const [code, setCode] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pickFile = (picked: File | null) => {
    if (preview) URL.revokeObjectURL(preview)
    setError(null)
    if (!picked) {
      setFile(null)
      setPreview(null)
      return
    }
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError('Formato no permitido: el comprobante debe ser JPG o PNG.')
      setFile(null)
      setPreview(null)
      return
    }
    if (picked.size > MAX_PROOF_BYTES) {
      setError('El comprobante supera el máximo de 5 MB.')
      setFile(null)
      setPreview(null)
      return
    }
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
  }

  const submit = async () => {
    if (!file && !code.trim()) {
      setError('Adjunta un comprobante (JPG/PNG) o ingresa el código de operación.')
      return
    }
    setError(null)
    try {
      await validatePayment(orderId, code, file)
      toast('Pago validado y pedido confirmado')
      onClose()
    } catch (e) {
      // Con pago válido pero sin stock el backend responde 409 con el detalle de faltantes (HU017).
      setError(errorMessage(e))
    }
  }

  return (
    <Modal open title={title} onClose={onClose}>
      <Notice>
        Al aprobar se valida el stock: con insumos suficientes el pedido se confirma y reserva; si
        falta algo, el pago queda registrado y verás el detalle del faltante.
      </Notice>
      <div className="mt-4 grid gap-4">
        <Field label="Comprobante de pago (JPG o PNG, máx. 5 MB)">
          <Input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        {preview && (
          <img
            src={preview}
            alt="Vista previa del comprobante"
            className="max-h-48 rounded-[7px]"
          />
        )}
        <Field label="Código de operación">
          <Input
            value={code}
            maxLength={100}
            placeholder="Ej. 00123456"
            onChange={(e) => setCode(e.target.value)}
          />
        </Field>
      </div>
      <FormError message={error} />
      <FormActions>
        <Button onClick={onClose}>Volver</Button>
        <Button variant="primary" disabled={pending} onClick={submit}>
          Aprobar pago
        </Button>
      </FormActions>
    </Modal>
  )
}

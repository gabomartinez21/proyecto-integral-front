import { useForm } from 'react-hook-form'
import {
  Button,
  Field,
  FormActions,
  FormError,
  FormGrid,
  Input,
  Modal,
  Select,
} from '@/components/ui'
import { LIMITS, type Ingredient, type StockMovementInput } from '@/domain'
import { useCommand } from '@/hooks/useCommand'

interface StockMovementDialogProps {
  ingredient: Ingredient
  onClose: () => void
}

type StockValues = Omit<StockMovementInput, 'id'>

export function StockMovementDialog({ ingredient, onClose }: StockMovementDialogProps) {
  const { run, error, pending } = useCommand()
  const { register, handleSubmit } = useForm<StockValues>({
    defaultValues: { kind: 'entrada', quantity: '', note: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (await run({ type: 'stock/move', payload: { ...values, id: ingredient.id } })) onClose()
  })

  return (
    <Modal open title={`Movimiento · ${ingredient.name}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="mt-4">
        <FormGrid>
          <Field label="Movimiento">
            <Select {...register('kind')}>
              <option value="entrada">Entrada / compra</option>
              <option value="salida">Salida / merma</option>
            </Select>
          </Field>
          <Field label={`Cantidad en ${ingredient.unit}`}>
            <Input type="number" required min={0.001} step={0.001} {...register('quantity')} />
          </Field>
          <Field label="Motivo *" className="sm:col-span-2">
            <Input
              required
              maxLength={LIMITS.text}
              placeholder="Compra semanal, merma…"
              {...register('note')}
            />
          </Field>
        </FormGrid>
        <FormError message={error} />
        <FormActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={pending}>
            Guardar
          </Button>
        </FormActions>
      </form>
    </Modal>
  )
}

import { useForm } from 'react-hook-form'
import {
  Button,
  Field,
  FormActions,
  FormError,
  FormGrid,
  Input,
  Modal,
  Notice,
  Select,
} from '@/components/ui'
import { LIMITS, UNITS, type IngredientInput } from '@/domain'
import { useCommand } from '@/hooks/useCommand'

export function IngredientFormDialog({ onClose }: { onClose: () => void }) {
  const { run, error, pending } = useCommand()
  const { register, handleSubmit } = useForm<IngredientInput>({
    defaultValues: { name: '', unit: UNITS[0], stock: 0, minimum: 0, cost: 0 },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (await run({ type: 'ingredient/create', payload: values })) onClose()
  })

  return (
    <Modal open title="Nuevo insumo" onClose={onClose}>
      <form onSubmit={onSubmit} className="mt-4">
        <FormGrid>
          <Field label="Nombre *">
            <Input required maxLength={LIMITS.text} {...register('name')} />
          </Field>
          <Field label="Unidad base *">
            <Select {...register('unit')}>
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field label="Cantidad inicial *">
            <Input type="number" required min={0} step={0.001} {...register('stock')} />
          </Field>
          <Field label="Cantidad mínima *">
            <Input type="number" required min={0} step={0.001} {...register('minimum')} />
          </Field>
          <Field label="Costo por unidad (S/) *">
            <Input type="number" required min={0.01} step={0.01} {...register('cost')} />
          </Field>
        </FormGrid>
        <Notice>Usa la misma unidad al definir recetas. Ejemplo: 500 g = 0.5 kg.</Notice>
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

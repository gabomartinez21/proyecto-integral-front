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
  Textarea,
} from '@/components/ui'
import { LIMITS, PRODUCT_CATEGORIES, type Product, type ProductInput } from '@/domain'
import { useCommand } from '@/hooks/useCommand'

interface ProductFormDialogProps {
  /** Producto a editar; `undefined` para crear uno nuevo. */
  product?: Product
  onClose: () => void
}

export function ProductFormDialog({ product, onClose }: ProductFormDialogProps) {
  const { run, error, pending } = useCommand()
  const { register, handleSubmit } = useForm<ProductInput>({
    defaultValues: {
      name: product?.name ?? '',
      price: product?.price ?? '',
      category: product?.category ?? PRODUCT_CATEGORIES[0],
      description: product?.description ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (await run({ type: 'product/save', payload: { ...values, id: product?.id } })) onClose()
  })

  return (
    <Modal open title={product ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <form onSubmit={onSubmit} className="mt-4">
        <FormGrid>
          <Field label="Nombre del producto *">
            <Input required maxLength={LIMITS.text} {...register('name')} />
          </Field>
          <Field label="Precio de venta (S/) *">
            <Input type="number" required min={0} step={0.01} {...register('price')} />
          </Field>
          <Field label="Categoría *">
            <Select {...register('category')}>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Descripción" className="sm:col-span-2">
            <Textarea maxLength={LIMITS.longText} {...register('description')} />
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

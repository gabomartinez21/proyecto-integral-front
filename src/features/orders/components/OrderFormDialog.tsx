import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
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
  Textarea,
} from '@/components/ui'
import { LIMITS, ORDER_CHANNELS, type OrderInput } from '@/domain'
import { useCommand } from '@/hooks/useCommand'
import { todayIso } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { useKitchenData } from '@/stores/kitchen.store'

interface OrderFormDialogProps {
  open: boolean
  onClose: () => void
}

export function OrderFormDialog({ open, onClose }: OrderFormDialogProps) {
  return (
    <Modal open={open} title="Nuevo pedido" onClose={onClose}>
      {open && <OrderForm onDone={onClose} />}
    </Modal>
  )
}

function OrderForm({ onDone }: { onDone: () => void }) {
  const { products } = useKitchenData()
  const orderable = useMemo(() => products.filter((p) => p.recipe.length), [products])
  const { run, error, pending } = useCommand()

  const { register, control, handleSubmit } = useForm<OrderInput>({
    defaultValues: {
      customer: '',
      date: todayIso(),
      channel: ORDER_CHANNELS[0],
      notes: '',
      items: [{ productId: orderable[0]?.id ?? '', quantity: 1 }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const onSubmit = handleSubmit(async (values) => {
    if (await run({ type: 'order/create', payload: values })) onDone()
  })

  return (
    <form onSubmit={onSubmit}>
      <FormGrid>
        <Field label="Nombre del cliente *">
          <Input required maxLength={LIMITS.text} {...register('customer')} />
        </Field>
        <Field label="Fecha de entrega *">
          <Input type="date" required {...register('date')} />
        </Field>
        <Field label="Canal">
          <Select {...register('channel')}>
            {ORDER_CHANNELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </FormGrid>

      <h3 className="mt-[22px]">Productos</h3>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="my-2.5 grid grid-cols-[1fr_80px_30px] gap-[9px] sm:grid-cols-[1fr_100px_32px]"
        >
          <Select aria-label="Producto" required {...register(`items.${index}.productId`)}>
            {orderable.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatMoney(p.price)}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={1}
            step={1}
            required
            aria-label="Cantidad de productos"
            {...register(`items.${index}.quantity`)}
          />
          <Button className="p-1" aria-label="Quitar producto" onClick={() => remove(index)}>
            ×
          </Button>
        </div>
      ))}
      <Button onClick={() => append({ productId: orderable[0]?.id ?? '', quantity: 1 })}>
        ＋ Agregar producto
      </Button>

      <Field label="Notas" className="mt-5">
        <Textarea maxLength={LIMITS.longText} {...register('notes')} />
      </Field>
      <Notice>
        El pedido se registra como pendiente. Al confirmarlo se validan y reservan los insumos
        disponibles.
      </Notice>
      <FormError message={error} />
      <FormActions>
        <Button onClick={onDone}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={pending}>
          Registrar pedido
        </Button>
      </FormActions>
    </form>
  )
}

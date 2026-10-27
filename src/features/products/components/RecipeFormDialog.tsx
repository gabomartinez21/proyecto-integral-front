import { useFieldArray, useForm } from 'react-hook-form'
import { Button, FormActions, FormError, Input, Modal, Notice, Select } from '@/components/ui'
import type { Product, RecipeInput } from '@/domain'
import { useCommand } from '@/hooks/useCommand'
import { useIsOwner } from '@/stores/auth.store'
import { useKitchenData } from '@/stores/kitchen.store'

interface RecipeFormDialogProps {
  product: Product
  onClose: () => void
}

type RecipeValues = Pick<RecipeInput, 'recipe'>

export function RecipeFormDialog({ product, onClose }: RecipeFormDialogProps) {
  const { ingredients } = useKitchenData()
  const canEdit = useIsOwner()
  const { run, error, pending } = useCommand()
  const { register, control, handleSubmit } = useForm<RecipeValues>({
    defaultValues: { recipe: product.recipe },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'recipe' })

  const onSubmit = handleSubmit(async ({ recipe }) => {
    if (await run({ type: 'recipe/save', payload: { id: product.id, recipe } })) onClose()
  })

  return (
    <Modal open title={`Receta · ${product.name}`} onClose={onClose}>
      <form onSubmit={onSubmit} className="mt-4">
        <p className="leading-relaxed text-muted">
          Cantidades para <strong>una unidad de venta</strong> del producto.
        </p>
        <fieldset disabled={!canEdit}>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="my-2.5 grid grid-cols-[1fr_80px_30px] gap-[9px] sm:grid-cols-[1fr_100px_32px]"
            >
              <Select
                aria-label="Ingrediente"
                required
                {...register(`recipe.${index}.ingredientId`)}
              >
                <option value="">Seleccionar insumo…</option>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.unit})
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                step={0.000001}
                min={0.000001}
                required
                placeholder="Cantidad"
                aria-label="Cantidad del ingrediente"
                {...register(`recipe.${index}.quantity`)}
              />
              <Button
                className="p-1"
                aria-label="Eliminar ingrediente"
                onClick={() => remove(index)}
              >
                ×
              </Button>
            </div>
          ))}
        </fieldset>
        {canEdit && (
          <Button onClick={() => append({ ingredientId: '', quantity: '' })}>
            ＋ Agregar ingrediente
          </Button>
        )}
        <Notice>
          Solo se pueden usar insumos registrados. Los cambios se aplicarán a nuevos pedidos; los
          existentes conservan su receta original.
        </Notice>
        {canEdit ? (
          <>
            <FormError message={error} />
            <FormActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={pending}>
                Guardar receta
              </Button>
            </FormActions>
          </>
        ) : (
          <Notice>Requiere permisos de dueño para editar esta receta.</Notice>
        )}
      </form>
    </Modal>
  )
}

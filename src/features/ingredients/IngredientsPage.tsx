import { useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Button, Panel } from '@/components/ui'
import { useIsOwner } from '@/stores/auth.store'
import { useKitchenData } from '@/stores/kitchen.store'
import { IngredientFormDialog } from './components/IngredientFormDialog'
import { IngredientsTable } from './components/IngredientsTable'
import { MovementsList } from './components/MovementsList'
import { StockMovementDialog } from './components/StockMovementDialog'

type DialogState = { kind: 'create' } | { kind: 'stock'; ingredientId: string } | null

export function IngredientsPage() {
  const { ingredients } = useKitchenData()
  const isOwner = useIsOwner()
  const [dialog, setDialog] = useState<DialogState>(null)
  const close = () => setDialog(null)

  const stockIngredient =
    dialog?.kind === 'stock' ? ingredients.find((i) => i.id === dialog.ingredientId) : undefined

  return (
    <>
      <PageHeader
        title="Insumos"
        subtitle="Revisa tus ingredientes y registra las compras."
        action={
          isOwner && (
            <Button
              variant="primary"
              className="text-xs whitespace-nowrap md:text-sm"
              onClick={() => setDialog({ kind: 'create' })}
            >
              ＋ Nuevo insumo
            </Button>
          )
        }
      />
      <Panel>
        <IngredientsTable
          onUpdateStock={
            isOwner ? (i) => setDialog({ kind: 'stock', ingredientId: i.id }) : undefined
          }
        />
      </Panel>
      <Panel>
        <h2>Últimos movimientos</h2>
        <MovementsList />
      </Panel>

      {dialog?.kind === 'create' && <IngredientFormDialog onClose={close} />}
      {stockIngredient && <StockMovementDialog ingredient={stockIngredient} onClose={close} />}
    </>
  )
}

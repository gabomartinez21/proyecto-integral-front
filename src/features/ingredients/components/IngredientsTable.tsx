import { useMemo } from 'react'
import { Badge, Button, EmptyState, Table, Td, Th, Tr } from '@/components/ui'
import { availableStock, reservedQuantities, type Ingredient } from '@/domain'
import { formatMoney, formatQuantity } from '@/lib/format'
import { useKitchenData } from '@/stores/kitchen.store'

interface IngredientsTableProps {
  /** Si se pasa, se muestra la acción para registrar movimientos. */
  onUpdateStock?: (ingredient: Ingredient) => void
}

export function IngredientsTable({ onUpdateStock }: IngredientsTableProps) {
  const state = useKitchenData()
  const reserved = useMemo(() => reservedQuantities(state), [state])

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>Insumo</Th>
            <Th>En almacén</Th>
            <Th>Reservado</Th>
            <Th>Disponible</Th>
            <Th>Mínimo</Th>
            <Th>Precio por unidad</Th>
            <Th>
              <span className="sr-only">Acciones</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {state.ingredients.map((i) => {
            const available = availableStock(i, reserved)
            return (
              <Tr key={i.id}>
                <Td>
                  <strong>{i.name}</strong>
                </Td>
                <Td>
                  {formatQuantity(i.stock)} {i.unit}
                </Td>
                <Td>{formatQuantity(reserved[i.id] ?? 0)}</Td>
                <Td>
                  <Badge tone={available <= i.minimum ? 'warn' : 'neutral'}>
                    {formatQuantity(available)} {i.unit}
                  </Badge>
                </Td>
                <Td>{formatQuantity(i.minimum)}</Td>
                <Td>{formatMoney(i.cost)}</Td>
                <Td>
                  {onUpdateStock && (
                    <Button variant="link" onClick={() => onUpdateStock(i)}>
                      Actualizar cantidad
                    </Button>
                  )}
                </Td>
              </Tr>
            )
          })}
        </tbody>
      </Table>
      {!state.ingredients.length && (
        <EmptyState>Aún no hay insumos. Registra el primero para crear recetas.</EmptyState>
      )}
    </>
  )
}

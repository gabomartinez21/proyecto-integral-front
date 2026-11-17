import { Badge, Button, EmptyState, Table, Td, Th, Tr } from '@/components/ui'
import type { ShoppingItem } from '@/domain'
import { formatMoney, formatQuantity } from '@/lib/format'

interface ShoppingTableProps {
  items: ShoppingItem[]
  /** Si se pasa, muestra la columna para registrar la compra de cada insumo. */
  onBuy?: (item: ShoppingItem) => void
}

export function ShoppingTable({ items, onBuy }: ShoppingTableProps) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>Insumo</Th>
            <Th>Necesario</Th>
            <Th>Disponible</Th>
            <Th>Comprar</Th>
            <Th>Estimado</Th>
            {onBuy && <Th>Ingreso</Th>}
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <Tr key={i.id}>
              <Td>
                <strong>{i.name}</strong>
              </Td>
              <Td>
                {formatQuantity(i.required)} {i.unit}
              </Td>
              <Td>
                {formatQuantity(i.available)} {i.unit}
              </Td>
              <Td>
                <Badge tone={i.buy ? 'warn' : 'success'}>
                  {i.buy ? `${formatQuantity(i.buy)} ${i.unit}` : 'Cubierto'}
                </Badge>
              </Td>
              <Td>{formatMoney(i.buy * i.cost)}</Td>
              {onBuy && (
                <Td>
                  {i.buy > 0 ? (
                    <Button variant="link" onClick={() => onBuy(i)}>
                      ✓ Marcar comprado
                    </Button>
                  ) : (
                    <span className="text-xs text-muted">Stock suficiente</span>
                  )}
                </Td>
              )}
            </Tr>
          ))}
        </tbody>
      </Table>
      {!items.length && (
        <EmptyState>No hay pedidos pendientes ni confirmados en esta semana.</EmptyState>
      )}
    </>
  )
}

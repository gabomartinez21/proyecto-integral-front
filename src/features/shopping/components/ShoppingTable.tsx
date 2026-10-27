import { Badge, EmptyState, Table, Td, Th, Tr } from '@/components/ui'
import type { ShoppingItem } from '@/domain'
import { formatMoney, formatQuantity } from '@/lib/format'

export function ShoppingTable({ items }: { items: ShoppingItem[] }) {
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
                <Badge tone={i.buy ? 'warn' : 'neutral'}>
                  {formatQuantity(i.buy)} {i.unit}
                </Badge>
              </Td>
              <Td>{formatMoney(i.buy * i.cost)}</Td>
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

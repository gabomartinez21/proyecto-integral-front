import { useMemo } from 'react'
import { Link } from 'react-router'
import { ROUTES } from '@/app/navigation'
import { Badge, EmptyState, ListRow, Panel, PanelHeader } from '@/components/ui'
import { availableStock, reservedQuantities, type Ingredient } from '@/domain'
import { formatQuantity } from '@/lib/format'
import { useKitchenData } from '@/stores/kitchen.store'

const MAX_ITEMS = 5

export function LowStockPanel({ items }: { items: Ingredient[] }) {
  const state = useKitchenData()
  const reserved = useMemo(() => reservedQuantities(state), [state])

  return (
    <Panel>
      <PanelHeader title="Insumos por reponer">
        <Badge tone="warn">{items.length} avisos</Badge>
      </PanelHeader>
      {items.length ? (
        items.slice(0, MAX_ITEMS).map((i) => (
          <ListRow
            key={i.id}
            title={
              <>
                <span className="mr-2 inline-block size-[9px] rounded-full bg-[#d9a256]" />
                {i.name}
              </>
            }
            subtitle={`Mínimo: ${formatQuantity(i.minimum)} ${i.unit}`}
            aside={
              <span>
                {formatQuantity(availableStock(i, reserved))} {i.unit}
              </span>
            }
          />
        ))
      ) : (
        <EmptyState title="Sin alertas de stock">Tu inventario se mostrará aquí.</EmptyState>
      )}
      <Link
        to={ROUTES.ingredients}
        className="mt-5 inline-block text-xs font-semibold text-link hover:underline"
      >
        Revisar inventario →
      </Link>
    </Panel>
  )
}

import { useMemo, useState } from 'react'
import { PageHeader, WeekToolbar } from '@/components/layout'
import { Button, Footnote, Panel, PanelHeader, StatCard, StatGrid } from '@/components/ui'
import { shoppingList, type ShoppingItem } from '@/domain'
import { addDays } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { useIsOwner } from '@/stores/auth.store'
import { useKitchenData } from '@/stores/kitchen.store'
import { useWeekStore } from '@/stores/week.store'
import { PurchaseDialog } from './components/PurchaseDialog'
import { ShoppingTable } from './components/ShoppingTable'

export function ShoppingPage() {
  const state = useKitchenData()
  const isOwner = useIsOwner()
  const start = useWeekStore((s) => s.start)
  const items = useMemo(() => shoppingList(state, start, addDays(start, 6)), [state, start])
  const budget = items.reduce((sum, i) => sum + i.buy * i.cost, 0)
  const [buying, setBuying] = useState<ShoppingItem | null>(null)

  return (
    <>
      <PageHeader
        title="Lista de compras"
        subtitle="Estos son los ingredientes que necesitas para tus pedidos."
      />
      <WeekToolbar />
      <StatGrid>
        <StatCard
          label="Insumos por comprar"
          value={items.filter((i) => i.buy > 0).length}
          hint="Para los pedidos de esta semana"
        />
        <StatCard
          label="Presupuesto estimado"
          value={formatMoney(budget)}
          hint="Total aproximado de la compra"
        />
      </StatGrid>
      <Panel>
        <PanelHeader title="Lista de compras semanal">
          <Button onClick={() => window.print()}>Imprimir lista</Button>
        </PanelHeader>
        <ShoppingTable items={items} onBuy={isOwner ? setBuying : undefined} />
      </Panel>
      <Footnote>
        {isOwner
          ? 'Cuando recibas tu compra, márcala como comprada para sumarla al almacén.'
          : 'Cuando recibas tu compra, avisa al dueño para que actualice el almacén.'}
      </Footnote>
      <PurchaseDialog item={buying} onClose={() => setBuying(null)} />
    </>
  )
}

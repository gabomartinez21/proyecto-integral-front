import { useMemo } from 'react'
import { PageHeader, WeekToolbar } from '@/components/layout'
import { Button, Footnote, Panel, PanelHeader, StatCard, StatGrid } from '@/components/ui'
import { shoppingList } from '@/domain'
import { addDays } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { useKitchenData } from '@/stores/kitchen.store'
import { useWeekStore } from '@/stores/week.store'
import { ShoppingTable } from './components/ShoppingTable'

export function ShoppingPage() {
  const state = useKitchenData()
  const start = useWeekStore((s) => s.start)
  const items = useMemo(() => shoppingList(state, start, addDays(start, 6)), [state, start])
  const budget = items.reduce((sum, i) => sum + i.buy * i.cost, 0)

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
        <ShoppingTable items={items} />
      </Panel>
      <Footnote>Cuando recibas tu compra, actualiza las cantidades en Insumos.</Footnote>
    </>
  )
}

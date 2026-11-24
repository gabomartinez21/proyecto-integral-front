import { useEffect, useMemo, useState } from 'react'
import { PageHeader, WeekToolbar } from '@/components/layout'
import { Button, Footnote, Panel, PanelHeader, StatCard, StatGrid } from '@/components/ui'
import { shoppingList, type ShoppingItem } from '@/domain'
import { addDays } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { formatMoney } from '@/lib/format'
import { useIsOwner } from '@/stores/auth.store'
import { kitchenApi } from '@/services/api'
import { useKitchenData } from '@/stores/kitchen.store'
import { useWeekStore } from '@/stores/week.store'
import { PurchaseDialog } from './components/PurchaseDialog'
import { ShoppingTable } from './components/ShoppingTable'

export function ShoppingPage() {
  const state = useKitchenData()
  const isOwner = useIsOwner()
  const start = useWeekStore((s) => s.start)
  const end = addDays(start, 6)
  // Plan B si el servidor no responde: mismo cálculo (misma regla) hecho en el cliente.
  const localItems = useMemo(() => shoppingList(state, start, end), [state, start, end])
  const [remote, setRemote] = useState<kitchenApi.ShoppingListResult | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // La lista la calcula el backend (HU021/HU022); se vuelve a pedir al cambiar la semana
  // o cuando cambian pedidos e insumos (p. ej. tras registrar una compra).
  useEffect(() => {
    let cancelled = false
    kitchenApi
      .fetchShoppingList(start, end)
      .then((result) => {
        if (cancelled) return
        setRemote(result)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setRemote(null)
        setLoadError(errorMessage(error))
      })
    return () => {
      cancelled = true
    }
  }, [start, end, state])

  const items = remote?.items ?? localItems
  const budget = remote?.budget ?? items.reduce((sum, i) => sum + i.buy * i.cost, 0)
  const [buying, setBuying] = useState<ShoppingItem | null>(null)

  return (
    <>
      <PageHeader
        title="Lista de compras"
        subtitle="Estos son los ingredientes que necesitas para tus pedidos."
      />
      <WeekToolbar />
      {loadError && (
        <p role="alert" className="mb-3 text-[13px] text-error">
          No se pudo leer la lista del servidor ({loadError}). Se muestra un cálculo local.
        </p>
      )}
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

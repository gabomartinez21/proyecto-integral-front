import { useMemo } from 'react'
import { Link } from 'react-router'
import { ROUTES } from '@/app/navigation'
import { PageHeader } from '@/components/layout'
import { Panel, PanelHeader, StatCard, StatGrid } from '@/components/ui'
import { isActiveOrder, lowStockIngredients, orderTotal } from '@/domain'
import { NewOrderButton, OrdersTable } from '@/features/orders'
import { todayIso } from '@/lib/dates'
import { formatMoney } from '@/lib/format'
import { useIsOwner } from '@/stores/auth.store'
import { useKitchenData } from '@/stores/kitchen.store'
import { GettingStarted } from './components/GettingStarted'
import { LowStockPanel } from './components/LowStockPanel'

const UPCOMING_LIMIT = 5

export function DashboardPage() {
  const state = useKitchenData()
  const isOwner = useIsOwner()

  const { active, upcoming, lowStock, todayCount, activeTotal } = useMemo(() => {
    const today = todayIso()
    const active = state.orders.filter(isActiveOrder)
    return {
      active,
      upcoming: [...active].sort((a, b) => a.date.localeCompare(b.date)).slice(0, UPCOMING_LIMIT),
      lowStock: lowStockIngredients(state),
      todayCount: active.filter((o) => o.date === today).length,
      activeTotal: active.reduce((sum, o) => sum + orderTotal(o), 0),
    }
  }, [state])

  const isEmpty = !state.products.length && !state.ingredients.length

  return (
    <>
      <PageHeader
        title="Resumen del negocio"
        subtitle="Revisa tus pedidos y lo que falta comprar."
        action={<NewOrderButton />}
      />
      <StatGrid>
        <StatCard
          label="Pedidos pendientes"
          value={active.length}
          hint="Por preparar y entregar"
          icon="orders"
        />
        <StatCard
          label="Entregas de hoy"
          value={todayCount}
          hint="Agenda del día"
          icon="calendar"
        />
        <StatCard
          label="Stock por revisar"
          value={lowStock.length}
          hint="Insumos en el mínimo o menos"
          icon="ingredients"
        />
        <StatCard
          label="Total de pedidos activos"
          value={formatMoney(activeTotal)}
          hint="Pedidos pendientes y confirmados"
          icon="shopping"
        />
      </StatGrid>
      <div className="grid grid-cols-1 gap-[22px] xl:grid-cols-[minmax(0,1.7fr)_minmax(270px,1fr)]">
        <Panel>
          <PanelHeader title="Próximos pedidos">
            <Link to={ROUTES.orders} className="text-xs font-semibold text-link hover:underline">
              Ver todos →
            </Link>
          </PanelHeader>
          <OrdersTable orders={upcoming} />
        </Panel>
        <LowStockPanel items={lowStock} />
      </div>
      {isOwner && isEmpty && <GettingStarted />}
    </>
  )
}

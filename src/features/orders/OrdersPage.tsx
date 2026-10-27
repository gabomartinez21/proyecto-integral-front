import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Button, Footnote, Panel } from '@/components/ui'
import { ORDER_STATUSES, type OrderStatus } from '@/domain'
import { useKitchenData } from '@/stores/kitchen.store'
import { NewOrderButton } from './components/NewOrderButton'
import { OrderDetailDialog } from './components/OrderDetailDialog'
import { OrdersTable } from './components/OrdersTable'

type Filter = 'Todos' | OrderStatus
const FILTERS: Filter[] = ['Todos', ...ORDER_STATUSES]

export function OrdersPage() {
  const { orders } = useKitchenData()
  const [filter, setFilter] = useState<Filter>('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = useMemo(
    () => orders.filter((o) => filter === 'Todos' || o.status === filter).reverse(),
    [orders, filter],
  )

  return (
    <>
      <PageHeader
        title="Pedidos"
        subtitle="Registra y revisa los pedidos de tus clientes."
        action={<NewOrderButton />}
      />
      <div
        className="mb-[22px] flex flex-wrap items-center gap-3"
        role="group"
        aria-label="Filtrar por estado"
      >
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'secondary' : 'default'}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      <Panel>
        <OrdersTable orders={visible} onSelect={(o) => setSelectedId(o.id)} />
      </Panel>
      <Footnote>
        Al confirmar un pedido se apartan sus ingredientes. Al entregarlo se descuentan del almacén.
      </Footnote>
      <OrderDetailDialog orderId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  )
}

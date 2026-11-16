import { useMemo, useState } from 'react'
import { PageHeader, WeekToolbar } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyState,
  Field,
  Footnote,
  FormActions,
  Input,
  Modal,
  Panel,
  PanelHeader,
  StatCard,
  StatGrid,
  Table,
  Td,
  Th,
  Tr,
} from '@/components/ui'
import { shoppingList, type ShoppingItem } from '@/domain'
import { addDays } from '@/lib/dates'
import { errorMessage } from '@/lib/errors'
import { formatMoney, formatQuantity } from '@/lib/format'
import { apiPedidosService } from '@/services/storage/api-pedidos'
import { useIsOwner } from '@/stores/auth.store'
import { useKitchenData, useKitchenStore } from '@/stores/kitchen.store'
import { toast } from '@/stores/toast.store'
import { useWeekStore } from '@/stores/week.store'

export function ShoppingPage() {
  const state = useKitchenData()
  const load = useKitchenStore((s) => s.load)
  const isOwner = useIsOwner()
  const start = useWeekStore((s) => s.start)
  const end = addDays(start, 6)
  const items = useMemo(() => shoppingList(state, start, end), [state, start, end])
  const budget = items.reduce((sum, i) => sum + i.buy * i.cost, 0)

  const [buyingItem, setBuyingItem] = useState<ShoppingItem | null>(null)
  const [qtyAcquired, setQtyAcquired] = useState('')

  const handleConfirmPurchase = async () => {
    if (!buyingItem) return
    const qty = Number(qtyAcquired)
    if (!qty || qty <= 0) {
      toast('Ingresa una cantidad válida mayor a 0')
      return
    }
    try {
      await apiPedidosService.confirmarCompraItem(buyingItem.id, qty)
      useKitchenStore.setState({ status: 'idle' })
      await load()
      toast(`Ingreso registrado: +${qty} ${buyingItem.unit} de ${buyingItem.name}`)
      setBuyingItem(null)
      setQtyAcquired('')
    } catch (e) {
      toast(errorMessage(e))
    }
  }

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

        <Table>
          <thead>
            <tr>
              <Th>Insumo</Th>
              <Th>Necesario</Th>
              <Th>Disponible</Th>
              <Th>Comprar</Th>
              <Th>Estimado</Th>
              {isOwner && <Th>Ingreso rápido (HU023)</Th>}
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
                {isOwner && (
                  <Td>
                    {i.buy > 0 ? (
                      <Button
                        variant="link"
                        onClick={() => {
                          setBuyingItem(i)
                          setQtyAcquired(String(i.buy))
                        }}
                      >
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
          <EmptyState>Stock suficiente para los pedidos de la semana.</EmptyState>
        )}
      </Panel>
      <Footnote>
        Cuando recibas tu compra, márcala como comprada para sumar la cantidad adquirida al almacén.
      </Footnote>

      <Modal
        open={Boolean(buyingItem)}
        title={`Confirmar compra · ${buyingItem?.name ?? ''}`}
        onClose={() => setBuyingItem(null)}
      >
        {buyingItem && (
          <div className="mt-4">
            <Field label={`Cantidad adquirida (${buyingItem.unit}) *`}>
              <Input
                type="number"
                min={0.001}
                step={0.001}
                value={qtyAcquired}
                onChange={(e) => setQtyAcquired(e.target.value)}
              />
            </Field>
            <FormActions>
              <Button onClick={() => setBuyingItem(null)}>Cancelar</Button>
              <Button variant="primary" onClick={() => void handleConfirmPurchase()}>
                Confirmar e ingresar a almacén
              </Button>
            </FormActions>
          </div>
        )}
      </Modal>
    </>
  )
}
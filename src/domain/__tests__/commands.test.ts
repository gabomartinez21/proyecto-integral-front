import { describe, expect, it } from 'vitest'
import { applyCommand, createInitialState, DomainError, reservedQuantities, shoppingList } from '..'
import type { KitchenState } from '..'

const withDemo = () => applyCommand(createInitialState(), { type: 'demo/load' })

function withOrder(state: KitchenState, quantity = 1, date = '2026-10-28') {
  return applyCommand(state, {
    type: 'order/create',
    payload: {
      customer: 'Ana',
      date,
      channel: 'WhatsApp',
      items: [{ productId: 'torta', quantity }],
    },
  })
}

describe('applyCommand', () => {
  it('no muta el estado original', () => {
    const initial = createInitialState()
    const next = applyCommand(initial, { type: 'demo/load' })
    expect(initial.products).toHaveLength(0)
    expect(next.products).toHaveLength(2)
  })

  it('impide a un empleado ejecutar comandos de dueño', () => {
    expect(() =>
      applyCommand(
        createInitialState(),
        {
          type: 'ingredient/create',
          payload: { name: 'Sal', unit: 'kg', stock: 1, minimum: 0, cost: 1 },
        },
        'employee',
      ),
    ).toThrow('Requiere permisos de dueño.')
  })

  it('rechaza productos con nombre duplicado', () => {
    expect(() =>
      applyCommand(withDemo(), {
        type: 'product/save',
        payload: { name: 'torta de chocolate', category: 'Postres', price: 10 },
      }),
    ).toThrow(DomainError)
  })

  it('crea pedidos pendientes con copia de la receta', () => {
    const state = withOrder(withDemo(), 2)
    expect(state.orders[0]).toMatchObject({ number: 1, status: 'Pendiente', customer: 'Ana' })
    expect(state.orders[0]?.items[0]?.recipe).toHaveLength(4)
  })

  it('reserva insumos al confirmar y los descuenta al entregar', () => {
    let state = withOrder(withDemo())
    const id = state.orders[0]!.id
    state = applyCommand(state, {
      type: 'order/changeStatus',
      payload: { id, status: 'Confirmado' },
    })
    expect(reservedQuantities(state).chocolate).toBe(0.5)

    state = applyCommand(state, {
      type: 'order/changeStatus',
      payload: { id, status: 'Entregado' },
    })
    expect(reservedQuantities(state).chocolate).toBeUndefined()
    expect(state.ingredients.find((i) => i.id === 'chocolate')?.stock).toBe(1.5)
    expect(state.movements).toHaveLength(4)
  })

  it('no confirma pedidos sin stock suficiente', () => {
    const state = withOrder(withDemo(), 5) // 2.5 kg de chocolate, hay 2 kg
    const id = state.orders[0]!.id
    expect(() =>
      applyCommand(state, { type: 'order/changeStatus', payload: { id, status: 'Confirmado' } }),
    ).toThrow(/Stock insuficiente: Chocolate bitter/)
  })

  it('no permite transiciones inválidas', () => {
    const state = withOrder(withDemo())
    const id = state.orders[0]!.id
    expect(() =>
      applyCommand(state, { type: 'order/changeStatus', payload: { id, status: 'Entregado' } }),
    ).toThrow('Cambio de estado no permitido.')
  })

  it('no permite retirar stock reservado', () => {
    let state = withOrder(withDemo(), 4) // 2 kg de chocolate
    const id = state.orders[0]!.id
    state = applyCommand(state, {
      type: 'order/changeStatus',
      payload: { id, status: 'Confirmado' },
    })
    expect(() =>
      applyCommand(state, {
        type: 'stock/move',
        payload: { id: 'chocolate', kind: 'salida', quantity: 0.1, note: 'Merma' },
      }),
    ).toThrow('No puedes retirar stock reservado para pedidos.')
  })
})

describe('shoppingList', () => {
  it('calcula lo que falta comprar en el rango', () => {
    const state = withOrder(withDemo(), 5)
    const chocolate = shoppingList(state, '2026-10-26', '2026-11-01').find(
      (i) => i.id === 'chocolate',
    )
    expect(chocolate).toMatchObject({ required: 2.5, available: 2, buy: 0.5 })
  })

  it('ignora pedidos fuera del rango', () => {
    const state = withOrder(withDemo(), 1, '2026-12-01')
    expect(shoppingList(state, '2026-10-26', '2026-11-01')).toHaveLength(0)
  })
})

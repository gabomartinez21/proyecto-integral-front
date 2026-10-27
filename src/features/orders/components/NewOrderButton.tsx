import { useState } from 'react'
import { Button } from '@/components/ui'
import { useKitchenData } from '@/stores/kitchen.store'
import { toast } from '@/stores/toast.store'
import { OrderFormDialog } from './OrderFormDialog'

/** Botón "Nuevo pedido" con su formulario; reutilizable en cualquier página. */
export function NewOrderButton() {
  const { products } = useKitchenData()
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    if (!products.some((p) => p.recipe.length))
      return toast('Primero registra un producto y define su receta.')
    setOpen(true)
  }

  return (
    <>
      <Button
        variant="primary"
        className="text-xs whitespace-nowrap md:text-sm"
        onClick={handleClick}
      >
        ＋ Nuevo pedido
      </Button>
      <OrderFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

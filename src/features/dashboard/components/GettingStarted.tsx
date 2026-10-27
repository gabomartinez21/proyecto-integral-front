import { Link } from 'react-router'
import { ROUTES } from '@/app/navigation'
import { Button, Notice } from '@/components/ui'
import { useCommand } from '@/hooks/useCommand'

/** Aviso para una base vacía: guía al dueño a registrar datos o cargar ejemplos. */
export function GettingStarted() {
  const { run, error, pending } = useCommand()

  return (
    <Notice>
      Para comenzar,{' '}
      <Link to={ROUTES.ingredients} className="font-semibold text-link hover:underline">
        registra tus insumos
      </Link>{' '}
      y luego agrega tus productos. ¿Quieres probar primero?{' '}
      <Button
        variant="link"
        disabled={pending}
        onClick={() => void run({ type: 'demo/load' }, 'Datos de ejemplo cargados')}
      >
        Cargar datos de ejemplo
      </Button>
      {error && <span className="block text-error">{error}</span>}
    </Notice>
  )
}

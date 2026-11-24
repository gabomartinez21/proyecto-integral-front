import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router'
import { Button } from '@/components/ui'
import { useKitchenStore } from '@/stores/kitchen.store'
import { LoadingScreen } from './LoadingScreen'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  const status = useKitchenStore((s) => s.status)
  const loadError = useKitchenStore((s) => s.loadError)
  const load = useKitchenStore((s) => s.load)

  const refresh = useKitchenStore((s) => s.refresh)

  useEffect(() => {
    if (status === 'idle') void load()
  }, [status, load])

  // Al volver a la pestaña se traen los cambios hechos por otros usuarios.
  useEffect(() => {
    if (status !== 'ready') return
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [status, refresh])

  if (status === 'error')
    return (
      <div className="p-20 text-center">
        <h2>No se pudieron cargar los datos</h2>
        <p>{loadError}</p>
        <p>Verifica que el servidor esté activo e inténtalo de nuevo.</p>
        <Button onClick={() => void load()}>Reintentar</Button>
      </div>
    )

  if (status !== 'ready') return <LoadingScreen />

  return (
    <div className="min-h-screen md:grid md:grid-cols-[200px_1fr] lg:grid-cols-[235px_1fr] print:block">
      <Sidebar />
      <div className="min-w-0">
        <Topbar />
        <main className="mx-auto max-w-[1550px] px-4 py-[23px] md:px-[23px] md:py-7 lg:px-[38px] lg:py-[34px] 2xl:px-[55px] 2xl:py-[45px] print:p-0">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

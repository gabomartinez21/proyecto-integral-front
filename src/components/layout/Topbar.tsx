import { Button } from '@/components/ui'
import { useCurrentNavItem } from '@/hooks/useCurrentNavItem'
import { useAuthStore } from '@/stores/auth.store'

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const current = useCurrentNavItem()
  if (!user) return null

  return (
    <header className="flex h-[60px] items-center justify-between gap-[15px] border-b border-line bg-white/70 px-[17px] md:h-20 md:px-[23px] lg:px-[38px] print:hidden">
      <span className="hidden text-muted md:inline">
        Mi cocina <span className="px-3 text-[#bcc3b7]">/</span>
        <strong className="text-[#52614b]">{current.title}</strong>
      </span>
      <div className="flex max-w-[75%] items-center gap-2.5 overflow-hidden text-xs md:ml-auto">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-[#e8ecdf] font-bold">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <span>
          {user.name}
          <small className="block text-muted">
            {user.role === 'owner' ? 'Dueño · Acceso completo' : 'Empleado · Gestión de pedidos'}
          </small>
        </span>
      </div>
      <Button variant="link" onClick={() => void logout()}>
        Salir
      </Button>
    </header>
  )
}

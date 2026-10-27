import { NavLink } from 'react-router'
import { NAV_ITEMS } from '@/app/navigation'
import { Icon } from '@/components/icons/Icon'
import { cn } from '@/lib/cn'
import { Brand } from './Brand'
import { Eyebrow } from './Eyebrow'

export function Sidebar() {
  return (
    <aside className="flex flex-col border-r border-line bg-white p-3.5 md:sticky md:top-0 md:h-screen md:px-[13px] md:py-[25px] lg:px-5 lg:py-[30px] print:hidden">
      <Brand />
      <Eyebrow className="hidden p-3 md:block">Mi negocio</Eyebrow>
      <nav aria-label="Principal" className="flex gap-[7px] overflow-auto md:grid">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-[13px] rounded-lg p-2.5 font-medium whitespace-nowrap text-[#717a73] transition hover:bg-canvas md:p-[13px]',
                isActive && 'bg-brand-soft font-bold text-brand-ink hover:bg-brand-soft',
              )
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto hidden px-[5px] pt-5 text-xs text-muted md:block">
        Surquillo, Lima · Perú
      </div>
    </aside>
  )
}

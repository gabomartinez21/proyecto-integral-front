import type { ReactNode } from 'react'
import { useCurrentNavItem } from '@/hooks/useCurrentNavItem'
import { Eyebrow } from './Eyebrow'

interface PageHeaderProps {
  title: string
  subtitle: string
  /** Acción principal de la página (p. ej. botón "Nuevo …"). */
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const current = useCurrentNavItem()
  return (
    <div className="mb-[27px] flex items-start justify-between gap-5 md:items-center print:hidden">
      <div>
        <Eyebrow className="mb-2.5">Mi cocina / {current.title}</Eyebrow>
        <h1 className="mb-[9px]">{title}</h1>
        <p className="mb-0 leading-relaxed text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

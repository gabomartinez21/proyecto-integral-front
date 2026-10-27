import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PanelProps {
  className?: string
  children: ReactNode
}

export const Panel = ({ className, children }: PanelProps) => (
  <section
    className={cn(
      'mb-[22px] rounded-[13px] border border-line bg-white p-[17px] md:p-[23px] print:m-0 print:break-inside-avoid print:border-0 print:p-0',
      className,
    )}
  >
    {children}
  </section>
)

interface PanelHeaderProps {
  title: string
  children?: ReactNode
}

export const PanelHeader = ({ title, children }: PanelHeaderProps) => (
  <div className="mb-[18px] flex items-center justify-between gap-3">
    <h2 className="m-0">{title}</h2>
    {children}
  </div>
)

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  title?: string
  children?: ReactNode
  className?: string
}

export const EmptyState = ({ title, children, className }: EmptyStateProps) => (
  <div className={cn('px-5 py-[38px] text-center leading-[1.7] text-[#879080]', className)}>
    {title && <strong className="mb-[7px] block text-[#52644b]">{title}</strong>}
    {children}
  </div>
)

export const Notice = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('my-3.5 rounded-lg bg-sage-50 p-3 text-xs leading-relaxed', className)}>
    {children}
  </div>
)

export const Footnote = ({ children }: { children: ReactNode }) => (
  <p className="my-5 text-[11px] leading-[1.7] text-subtle print:hidden">{children}</p>
)

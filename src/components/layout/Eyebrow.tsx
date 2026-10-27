import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('text-[10px] font-bold tracking-[1.8px] text-muted uppercase', className)}>
    {children}
  </div>
)

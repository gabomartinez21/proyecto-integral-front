import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-auto">
    <table className="w-full border-collapse text-left whitespace-nowrap print:whitespace-normal">
      {children}
    </table>
  </div>
)

const cell = 'border-b border-line-soft px-3 py-3.5'

export const Th = ({ className, ...props }: ComponentProps<'th'>) => (
  <th
    className={cn(
      cell,
      'bg-[#fafbf8] text-[10px] font-semibold tracking-[0.6px] text-[#889084] uppercase',
      className,
    )}
    {...props}
  />
)

export const Td = ({ className, ...props }: ComponentProps<'td'>) => (
  <td
    className={cn(cell, 'text-xs print:text-xs [tr:last-child_&]:border-b-0', className)}
    {...props}
  />
)

export const Tr = (props: ComponentProps<'tr'>) => (
  <tr className="print:break-inside-avoid" {...props} />
)

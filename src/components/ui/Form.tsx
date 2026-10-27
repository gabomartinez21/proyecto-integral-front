import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-[7px] border border-field bg-white px-3 py-[11px] text-ink disabled:bg-canvas disabled:opacity-70'

export const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input className={cn(control, className)} {...props} />
)

export const Select = ({ className, ...props }: ComponentProps<'select'>) => (
  <select className={cn(control, className)} {...props} />
)

export const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea className={cn(control, 'min-h-[70px] resize-y', className)} {...props} />
)

interface FieldProps {
  label: string
  className?: string
  children: ReactNode
}

/** Etiqueta + control. El `<label>` envuelve al control, así no hacen falta ids. */
export const Field = ({ label, className, children }: FieldProps) => (
  <label className={cn('grid gap-[7px] text-xs font-semibold', className)}>
    {label}
    {children}
  </label>
)

export const FormGrid = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
)

export const FormError = ({ message }: { message?: string | null }) => (
  <div role="alert" className="mt-[15px] text-[13px] text-error empty:hidden">
    {message}
  </div>
)

export const FormActions = ({ children }: { children: ReactNode }) => (
  <div className="mt-[25px] flex justify-end gap-2.5">{children}</div>
)

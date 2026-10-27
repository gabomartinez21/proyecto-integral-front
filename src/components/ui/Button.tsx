import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

const variants = {
  default: 'border-line bg-white text-ink hover:brightness-[.97]',
  primary: 'border-brand bg-brand text-white hover:brightness-110',
  secondary: 'border-sage-200 bg-sage-100 text-ink',
  danger: 'border-line bg-white text-danger hover:bg-red-50',
  link: 'border-0 bg-transparent p-0 text-xs text-link hover:underline',
} as const

export type ButtonVariant = keyof typeof variants

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
}

export function Button({ variant = 'default', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'rounded-lg border px-[15px] py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 print:hidden',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

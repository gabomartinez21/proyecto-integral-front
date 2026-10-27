import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const tones = {
  neutral: 'bg-[#edf0e9] text-[#68775c]',
  warn: 'bg-warn-soft text-warn',
  success: 'bg-[#e9f0e1] text-[#597d43]',
  info: 'bg-[#e1efed] text-[#337568]',
  danger: 'bg-[#f9e9e4] text-[#9e5a4c]',
  glass: 'bg-white/80 text-[#68775c]',
} as const

export type BadgeTone = keyof typeof tones

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-[5px] px-2 py-[5px] text-[10px] font-bold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

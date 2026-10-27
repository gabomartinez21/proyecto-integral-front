import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/icons/Icon'

interface StatCardProps {
  label: string
  value: ReactNode
  hint: string
  icon?: IconName
}

export const StatCard = ({ label, value, hint, icon }: StatCardProps) => (
  <div className="rounded-xl border border-line bg-white p-[15px] lg:p-[21px]">
    <div className="flex items-center justify-between text-xs text-[#727b70]">
      {label}
      {icon && (
        <span className="flex rounded-[9px] bg-[#f0f3eb] p-2">
          <Icon name={icon} />
        </span>
      )}
    </div>
    <strong className="mt-3.5 mb-[5px] block font-display text-[26px] tracking-[-1px] md:text-[30px]">
      {value}
    </strong>
    <small className="text-[11px] text-muted">{hint}</small>
  </div>
)

export const StatGrid = ({ children }: { children: ReactNode }) => (
  <div className="mb-7 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-[17px] print:hidden">
    {children}
  </div>
)

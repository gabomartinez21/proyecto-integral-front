import type { ReactNode } from 'react'

interface ListRowProps {
  title: ReactNode
  subtitle?: ReactNode
  aside?: ReactNode
}

export const ListRow = ({ title, subtitle, aside }: ListRowProps) => (
  <div className="flex items-center justify-between gap-[15px] border-b border-line py-3.5 last:border-0">
    <div>
      <strong>{title}</strong>
      {subtitle && <small className="mt-[5px] block text-muted">{subtitle}</small>}
    </div>
    {aside}
  </div>
)

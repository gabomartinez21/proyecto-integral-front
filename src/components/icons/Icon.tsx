import type { ReactNode } from 'react'

const paths = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  orders: <path d="M7 4H5v17h14V4h-2M9 3h6v4H9zM8 12h8M8 16h5" />,
  products: <path d="M4 8l8-5 8 5v11l-8 3-8-3zM4 8l8 4 8-4M12 12v10" />,
  ingredients: <path d="M4 7h16v14H4zM3 3h18v4H3zM9 11h6" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 2v6M17 2v6M3 11h18M7 15h2M14 15h2" />
    </>
  ),
  shopping: <path d="M2 3h3l3 13h11l3-9H6M10 21h.01M18 21h.01" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

export const Icon = ({ name }: { name: IconName }) => (
  <svg
    className="size-[19px] shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths[name]}
  </svg>
)

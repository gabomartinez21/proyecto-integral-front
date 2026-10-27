import { useLocation } from 'react-router'
import { NAV_ITEMS } from '@/app/navigation'

export function useCurrentNavItem() {
  const { pathname } = useLocation()
  return NAV_ITEMS.find((item) => item.path === pathname) ?? NAV_ITEMS[0]!
}

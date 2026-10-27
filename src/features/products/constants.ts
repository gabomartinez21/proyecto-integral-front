import type { ProductCategory } from '@/domain'

/** Presentación visual de cada categoría. */
export const CATEGORY_STYLE: Record<ProductCategory, { emoji: string; background: string }> = {
  Postres: { emoji: '🍰', background: 'bg-[#f0e9df]' },
  Viandas: { emoji: '🍲', background: 'bg-[#e8eddc]' },
  Eventos: { emoji: '🍽️', background: 'bg-[#ece6ed]' },
  Otros: { emoji: '🥣', background: 'bg-[#f0e9df]' },
}

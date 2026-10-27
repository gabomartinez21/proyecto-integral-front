import { Badge, Button } from '@/components/ui'
import type { Product } from '@/domain'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/lib/format'
import { CATEGORY_STYLE } from '../constants'

interface ProductCardProps {
  product: Product
  canEdit: boolean
  onOpenRecipe: () => void
  onEdit: () => void
}

export function ProductCard({ product, canEdit, onOpenRecipe, onEdit }: ProductCardProps) {
  const style = CATEGORY_STYLE[product.category]
  const ingredients = product.recipe.length

  return (
    <article className="overflow-hidden rounded-[13px] border border-line bg-white">
      <div
        className={cn(
          'relative flex h-[120px] items-center justify-center text-[50px]',
          style.background,
        )}
      >
        <Badge tone="glass" className="absolute top-3.5 left-[15px]">
          {product.category}
        </Badge>
        <span aria-hidden="true">{style.emoji}</span>
      </div>
      <div className="p-[21px]">
        <h3 className="mb-[7px]">{product.name}</h3>
        <p className="min-h-[37px] text-xs leading-relaxed text-muted">
          {product.description || 'Preparado con el sabor de casa.'}
        </p>
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-[19px] font-bold">{formatMoney(product.price)}</span>
          <Badge tone={ingredients ? 'neutral' : 'warn'}>
            {ingredients ? `${ingredients} ingredientes` : 'Sin receta'}
          </Badge>
        </div>
        <div className="mt-[17px] flex gap-[7px]">
          <Button className="flex-1 text-xs" onClick={onOpenRecipe}>
            {canEdit ? 'Ver / editar receta' : 'Ver receta'}
          </Button>
          {canEdit && (
            <Button className="flex-1 text-xs" onClick={onEdit}>
              Editar
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}

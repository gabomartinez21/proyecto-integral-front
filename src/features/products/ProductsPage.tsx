import { useDeferredValue, useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Button, EmptyState, Input, Panel, Select } from '@/components/ui'
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/domain'
import { useIsOwner } from '@/stores/auth.store'
import { useKitchenData } from '@/stores/kitchen.store'
import { ProductCard } from './components/ProductCard'
import { ProductFormDialog } from './components/ProductFormDialog'
import { RecipeFormDialog } from './components/RecipeFormDialog'

type CategoryFilter = 'Todas' | ProductCategory

type DialogState =
  { kind: 'product'; productId?: string } | { kind: 'recipe'; productId: string } | null

export function ProductsPage() {
  const { products } = useKitchenData()
  const isOwner = useIsOwner()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('Todas')
  const [dialog, setDialog] = useState<DialogState>(null)
  const deferredQuery = useDeferredValue(query)

  const visible = useMemo(() => {
    const q = deferredQuery.toLocaleLowerCase()
    return products.filter(
      (p) =>
        (category === 'Todas' || p.category === category) && p.name.toLocaleLowerCase().includes(q),
    )
  }, [products, category, deferredQuery])

  const dialogProduct = dialog?.productId
    ? products.find((p) => p.id === dialog.productId)
    : undefined
  const close = () => setDialog(null)

  return (
    <>
      <PageHeader
        title="Productos y recetas"
        subtitle="Agrega tus productos y los ingredientes de cada receta."
        action={
          isOwner && (
            <Button
              variant="primary"
              className="text-xs whitespace-nowrap md:text-sm"
              onClick={() => setDialog({ kind: 'product' })}
            >
              ＋ Nuevo producto
            </Button>
          )
        }
      />

      <div className="mb-[22px] flex flex-wrap items-center gap-3">
        <Input
          type="search"
          className="max-w-[400px] min-w-[180px] flex-1"
          placeholder="Buscar un producto…"
          aria-label="Buscar productos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          className="w-auto"
          aria-label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoryFilter)}
        >
          {(['Todas', ...PRODUCT_CATEGORIES] as const).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <span className="text-[11px] text-muted">{visible.length} productos</span>
      </div>

      {visible.length ? (
        <div className="grid grid-cols-1 gap-[19px] sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              canEdit={isOwner}
              onOpenRecipe={() => setDialog({ kind: 'recipe', productId: product.id })}
              onEdit={() => setDialog({ kind: 'product', productId: product.id })}
            />
          ))}
        </div>
      ) : (
        <Panel>
          <EmptyState title="No se encontraron resultados">
            Prueba con otro nombre o registra un nuevo producto.
          </EmptyState>
        </Panel>
      )}

      {dialog?.kind === 'product' && <ProductFormDialog product={dialogProduct} onClose={close} />}
      {dialog?.kind === 'recipe' && dialogProduct && (
        <RecipeFormDialog product={dialogProduct} onClose={close} />
      )}
    </>
  )
}

import type { Ingredient, Product } from './types'

export const DEMO_INGREDIENTS: Ingredient[] = [
  { id: 'harina', name: 'Harina de trigo', unit: 'kg', stock: 12, minimum: 3, cost: 5.5 },
  { id: 'chocolate', name: 'Chocolate bitter', unit: 'kg', stock: 2, minimum: 1, cost: 32 },
  { id: 'azucar', name: 'Azúcar rubia', unit: 'kg', stock: 8, minimum: 2, cost: 4.5 },
  { id: 'huevo', name: 'Huevos', unit: 'unidad', stock: 48, minimum: 12, cost: 0.6 },
  { id: 'pollo', name: 'Pechuga de pollo', unit: 'kg', stock: 5, minimum: 2, cost: 18 },
  { id: 'arroz', name: 'Arroz', unit: 'kg', stock: 10, minimum: 3, cost: 4.8 },
]

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'torta',
    name: 'Torta de chocolate',
    category: 'Postres',
    price: 65,
    description: 'Torta casera, presentación de 8 porciones.',
    recipe: [
      { ingredientId: 'harina', quantity: 0.4 },
      { ingredientId: 'chocolate', quantity: 0.5 },
      { ingredientId: 'azucar', quantity: 0.3 },
      { ingredientId: 'huevo', quantity: 4 },
    ],
  },
  {
    id: 'vianda',
    name: 'Pollo con arroz',
    category: 'Viandas',
    price: 16,
    description: 'Una porción individual para el almuerzo.',
    recipe: [
      { ingredientId: 'pollo', quantity: 0.2 },
      { ingredientId: 'arroz', quantity: 0.15 },
    ],
  },
]

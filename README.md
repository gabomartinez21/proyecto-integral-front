# Sabores de Barbarita · Frontend

Gestión de cocina: pedidos, productos y recetas, insumos, calendario de entregas y lista de compras.

**Stack:** React 19 · TypeScript (strict) · Vite 7 · Tailwind CSS 4 · React Router 7 · Zustand · React Hook Form · Zod · Vitest

## Comandos

```bash
npm install
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve el build
npm run test       # tests (modo watch) · test:run para una pasada
npm run lint       # ESLint
npm run format     # Prettier (ordena también las clases de Tailwind)
```

Usuarios de demostración: `admin` / `Barbarita2026!` (dueño) y `empleado` / `Pedidos2026!` (empleado).

## Arquitectura

```
src/
├── app/            # Composición: App, router, guards de rutas, navegación
├── domain/         # Reglas de negocio PURAS (sin React). Tipos, validaciones, comandos
│   ├── commands/   # Un archivo por operación (patrón Command) + dispatcher con permisos
│   └── __tests__/
├── services/       # Acceso a datos detrás de interfaces (repositorio, autenticación)
├── stores/         # Estado global con Zustand (auth, cocina, semana, toast)
├── hooks/          # Hooks compartidos (useCommand, useCurrentNavItem)
├── lib/            # Utilidades genéricas: fechas, formato, cn()
├── components/
│   ├── ui/         # Componentes base reutilizables (Button, Modal, Table, Badge…)
│   ├── layout/     # Estructura de la app (sidebar, topbar, encabezados)
│   └── icons/
├── features/       # Un módulo por área de negocio, cada uno con su index.ts público
│   ├── auth/  dashboard/  orders/  products/  ingredients/  calendar/  shopping/
└── styles/         # Tailwind + tokens de diseño (@theme)
```

### Flujo de datos

```
Componente ──useCommand().run({ type, payload })──▶ kitchen.store.dispatch
   ▲                                                    │
   │                                     applyCommand (domain, puro, valida permisos)
   │                                                    │
   └──────── useKitchenData() ◀──── set(state) ◀── kitchenRepository.write
```

- **`domain/` es la única fuente de verdad de las reglas.** Es TypeScript puro y está cubierto por tests;
  los formularios solo usan validación HTML básica y muestran el error que devuelve el dominio.
- **Persistencia intercambiable:** `services/storage` define `KitchenRepository`. Hoy se usa
  `localStorage` (con la misma clave que la versión anterior, así que los datos existentes se conservan).
  Para conectar un backend, crea `ApiKitchenRepository` y cámbialo en `services/storage/index.ts`.
- **Concurrencia optimista:** cada escritura incrementa `revision`; si otra pestaña guardó antes,
  no se sobrescribe y se pide al usuario revisar.
- **Rutas con lazy loading:** cada página es un chunk independiente.

## Convenciones

- **Nueva operación de negocio:** agrega el tipo en `domain/commands/types.ts`, crea su handler
  en `domain/commands/`, regístralo en `commands/index.ts` (y en `EMPLOYEE_COMMANDS` si aplica) y añade tests.
- **Nueva página:** crea `features/<modulo>/` con `<Modulo>Page.tsx`, `components/` e `index.ts`;
  registra la ruta en `app/router.tsx` y el ítem en `app/navigation.ts`.
- Entre features, importa solo desde su `index.ts` (p. ej. `@/features/orders`).
- Estilos: usa los tokens de `styles/index.css` (`bg-brand`, `text-muted`, `border-line`…) y `cn()`
  para clases condicionales. Variantes de componentes como mapas de clases (ver `Button`, `Badge`).
- Alias de imports: `@/` → `src/`.

## Notas

- La autenticación es **solo de demostración** (credenciales en el cliente). Debe reemplazarse por un
  servicio con backend implementando la interfaz `AuthService`.
- La versión original en JavaScript vanilla está en `legacy/` como referencia.

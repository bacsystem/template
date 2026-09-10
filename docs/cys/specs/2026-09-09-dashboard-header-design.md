# Dashboard Header — Diseño

**Fecha:** 2026-09-09
**Estado:** Aprobado, pendiente de implementación

## Contexto

Primera de varias piezas de UI para el área protegida de la plantilla
`templates/nextjs-react/` (`docs/cys/specs/2026-09-07-nextjs-react-template-design.md`):
Header, Sidebar, Profile y una barra de tema personalizada. Este spec
cubre **solo el Header** — las demás piezas son tareas separadas,
posteriores.

Hoy `src/app/dashboard/page.tsx` es una página suelta sin layout propio
(`loading` / `error` / contenido), y `src/app/layout.tsx` (raíz) solo
envuelve con `Providers`.

## Decisión de arquitectura

El Header (y más adelante el Sidebar) vive en un **layout anidado**
propio del área `/dashboard`, no inline en `page.tsx` ni en el layout
raíz. Next.js App Router soporta layouts anidados para esto:

- Un `src/app/dashboard/layout.tsx` nuevo envuelve `{children}` con el
  Header.
- Cuando se agregue Sidebar, se suma una vez en ese mismo layout y
  aplica automáticamente a cualquier página futura bajo `/dashboard`,
  sin tocar cada página individual.
- `dashboard/page.tsx` no cambia: sigue exportando solo su contenido,
  Next.js lo inserta como `children` del layout.

## Componentes

### `src/shared/components/header.tsx`

Componente genérico, sin lógica de negocio, sin imports de `features/`
(regla del `CLAUDE.md` raíz para `shared/components/`). Server Component
— no usa hooks ni estado, así que no lleva `'use client'`.

```ts
interface HeaderProps {
  title?: string;
  actions?: React.ReactNode; // slot para Profile / theme bar, futuro
}
```

- Renderiza un `<header>` semántico con borde inferior.
- `title` se muestra si está presente; si no, el header queda solo con
  el slot.
- `actions` se renderiza tal cual si está presente; si no, no se
  renderiza nada en su lugar (sin placeholder vacío).
- Solo clases Tailwind respaldadas por las variables CSS ya existentes
  en `globals.css` (`--color-background`, `--color-foreground`,
  `--color-input`) — regla de oro del monorepo, nada de estilos
  hardcodeados.

Nota de nombres: el slot se llama `actions`, no `children`, para no
confundirse con el `children` del propio `layout.tsx` de Next (que es
el contenido de la página, un concepto distinto).

### `src/app/dashboard/layout.tsx`

```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="Dashboard" />
      {children}
    </>
  );
}
```

Sin `actions` todavía — queda vacío hasta que exista Profile/theme bar.
Título fijo ("Dashboard") por ahora: hay una sola página bajo esta
ruta; un título por-página es un problema a resolver si aparece una
segunda página (fuera de alcance de este spec, YAGNI).

**Corrección encontrada en auto-review:** `dashboard/page.tsx` ya
renderiza su propio `<h1>Dashboard</h1>` en el estado de éxito. Si el
layout agrega el Header con el mismo título, la pantalla queda con dos
encabezados "Dashboard" duplicados. Para evitarlo, este spec sí incluye
un cambio mínimo en `page.tsx`: eliminar ese `<h1>` del estado de
éxito (pasa a `<p>Total items: …</p>` / `<p>Last updated: …</p>` sin
encabezado propio, ya que el Header del layout cubre ese rol). Los
estados `loading`/`error` no tienen `<h1>` y no se tocan.

## Data flow

Ninguno propio del Header — es puramente presentacional. El layout no
hace fetching ni valida sesión (eso ya lo resuelve `middleware.ts`
antes de que la request llegue a esta ruta).

## Manejo de errores

No aplica — sin estado, sin async, sin puntos de fallo propios.

## Testing

- `src/shared/components/header.test.tsx`:
  - muestra el `title` cuando se pasa
  - renderiza el contenido de `actions` cuando se pasa
  - no rompe si se renderiza sin props
- `src/app/dashboard/layout.test.tsx`:
  - renderiza el Header con título "Dashboard"
  - renderiza el `children` (contenido de página) pasado
- `src/app/dashboard/page.tsx`: cambio mínimo — se quita el `<h1>`
  duplicado del estado de éxito (ver corrección arriba).
- `src/app/dashboard/page.test.tsx`: sin cambios necesarios — el test
  actual no verifica el `<h1>`, solo "Total items…" / "Last updated…"
  / loading / error, así que sigue pasando tal cual.

## Fuera de alcance

- Sidebar, Profile, theme bar — tareas separadas posteriores.
- Título por página / navegación con breadcrumbs.
- Cualquier acción real dentro del slot `actions` (queda vacío en esta
  tarea).

# Plantilla Next.js/React — Diseño

**Fecha:** 2026-09-07
**Estado:** Aprobado, pendiente de implementación

## Contexto

Este repo (`template`) es un monorepo que alberga plantillas base para
proyectos futuros. Este documento cubre la primera: una plantilla de
Next.js/React pensada como **frontend que consume una API externa**
(no como full-stack con su propia base de datos). Next.js actúa de
capa de UI y de proxy autenticado hacia esa API externa.

Vivirá en `nextjs-react/` dentro de este monorepo. Una plantilla de
Angular es un sub-proyecto separado, con su propio ciclo de diseño.

## Stack base

- Next.js (App Router) + TypeScript (`strict: true`)
- pnpm como package manager
- Tailwind CSS
- ESLint + Prettier + Husky (pre-commit con lint-staged sobre archivos staged)
- TanStack Query para data fetching contra la API externa
- Zustand para estado global de cliente (con un store de ejemplo, listo para extender)
- shadcn/ui (Radix UI + `class-variance-authority`) para componentes de UI, instalados como código propio en el repo
- `sonner` para toasts (integración oficial de shadcn/ui)
- `lucide-react` para iconos
- `next-themes` + variables CSS en Tailwind para dark/light mode y re-tematización por cliente
- Vitest + React Testing Library + `msw` (Mock Service Worker) para tests
- Docker (build `standalone`) + nginx como reverse proxy
- GitHub Actions para CI

## Estructura de carpetas (feature-based)

```
nextjs-react/
  src/
    app/                      # rutas de Next.js (App Router)
      (auth)/
        login/page.tsx
      dashboard/page.tsx
      api/auth/[...]/route.ts # route handlers proxy (login/logout) que setean la cookie httpOnly
      layout.tsx
      middleware.ts           # protege rutas leyendo la cookie httpOnly
      error.tsx
      global-error.tsx
    features/
      auth/
        components/
        hooks/
        api.ts                # llamadas a la API externa relacionadas a auth
        types.ts
      dashboard/
        components/
        hooks/
        api.ts
        types.ts
    shared/
      components/
        ui/                   # primitivos shadcn/ui
      hooks/
      lib/                    # cliente http, config de TanStack Query, utils
      stores/                 # stores de Zustand
      types/
    styles/
      globals.css             # tokens/variables CSS por tema
  Dockerfile
  docker-compose.yml
  nginx.conf
  .github/workflows/ci.yml
  CLAUDE.md
```

Cada `features/*` es autocontenida (UI, hooks, capa de API, tipos) y no
es importada por otra feature. `shared/` es lo transversal.

### Regla de componentes (documentada en `CLAUDE.md` de la plantilla)

Todo componente en `shared/components/` debe ser genérico:
configurable vía props (`variant`, `size`, etc. siguiendo el patrón
CVA de shadcn/ui), debe aceptar `className` para overrides puntuales,
no debe contener lógica de negocio ni de una feature particular, y no
debe importar nada de `features/`. Esto asegura que sean reutilizables
en todo el proyecto y en proyectos futuros basados en esta plantilla.

## Theming

- `next-themes` maneja el toggle claro/oscuro con persistencia
- `styles/globals.css` centraliza las variables CSS (`--color-primary`,
  `--color-bg`, etc.) consumidas por `tailwind.config`, de forma que
  recolorear la plantilla para un cliente nuevo sea cuestión de editar
  ese bloque de variables, sin tocar componentes

## Autenticación

- `POST /api/auth/login` (route handler) recibe credenciales, llama a
  la API externa, y si es exitoso setea el token en una cookie
  (`HttpOnly`, `Secure`, `SameSite=Lax`)
- `middleware.ts` lee la cookie en rutas protegidas y redirige a
  `/login` si falta o es inválida
- Las llamadas del cliente a la API externa pasan siempre por rutas
  internas de Next.js (nunca directo desde el navegador a la API
  externa), que reenvían el token desde la cookie
- `POST /api/auth/logout` limpia la cookie
- CSRF token en los route handlers que mutan estado (login/logout),
  ya que el navegador adjunta la cookie automáticamente
- `useAuthStore` (Zustand) guarda solo estado derivado de UI (ej. datos
  de usuario, `isAuthenticated`); el token nunca llega al JS de cliente

## Data fetching y manejo de errores

- Cliente HTTP centralizado en `shared/lib/http.ts` (wrapper sobre
  `fetch`): agrega headers, maneja `401` (redirige a login), normaliza
  errores a `{ status, message, details }`
- `features/*/api.ts` expone funciones tipadas sobre ese cliente,
  consumidas vía hooks de TanStack Query (`useQuery`/`useMutation`)
- `app/error.tsx` + `app/global-error.tsx` para errores no controlados
- Estados de carga/error por componente vía TanStack Query
  (`isPending`, `isError`)
- Errores de mutación se notifican con `sonner`

## Testing

- Vitest + React Testing Library, tests co-ubicados
  (`Component.test.tsx` junto a `Component.tsx`)
- `vitest.setup.ts` con mocks base (ej. `matchMedia` para
  `next-themes`)
- `msw` mockea la API externa en tests de hooks/`api.ts`
- Ejemplo de test en cada capa: un componente `shared/components/ui`,
  un hook de una feature, una función de `api.ts`

## CI/CD y despliegue

- `.github/workflows/ci.yml`: un job en push/PR a `main` — install
  (pnpm, con cache) → lint → typecheck (`tsc --noEmit`) → test → build
- `Dockerfile` multi-stage (`deps` → `builder` → `runner`, output
  `standalone`)
- `nginx.conf` de ejemplo como reverse proxy (gzip, headers de
  seguridad básicos, `proxy_pass` al contenedor de Next.js)
- `docker-compose.yml` para levantar Next.js + nginx juntos localmente

## Fuera de alcance

- Base de datos / ORM (esta plantilla es solo frontend + proxy de auth)
- Internacionalización (i18n) — no se pidió, se agrega por proyecto si
  hace falta
- Plantilla de Angular — sub-proyecto separado, diseño aparte

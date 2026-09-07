# Plantilla Next.js/React — Diseño

**Fecha:** 2026-09-07
**Estado:** Aprobado, pendiente de implementación

## Contexto

Primera plantilla concreta del monorepo (`docs/cys/specs/2026-09-07-monorepo-structure-design.md`),
en `templates/nextjs-react/`. Pensada como **frontend que consume una
API externa** (no full-stack con su propia base de datos): Next.js
actúa de capa de UI y de proxy autenticado hacia esa API.

Debe ser compatible con el CLI `pnpm create:project` del monorepo: usa
los placeholders `__PROJECT_NAME__`, `__THEME_PRIMARY__` y
`__API_BASE_URL__` en los archivos que el CLI completa (`package.json`,
`.env.example`, variables CSS de tema).

Hereda las reglas compartidas del `CLAUDE.md` raíz (componentes
genéricos, no hardcodear estilos, DRY, SOLID, placeholders). Este
documento cubre lo específico de esta plantilla.

## Stack

- Next.js (App Router) + TypeScript (`strict: true`)
- pnpm, ESLint + Prettier + Husky (pre-commit con lint-staged)
- Tailwind CSS
- TanStack Query (data fetching) + Zustand (estado global de cliente,
  store de ejemplo listo para extender)
- shadcn/ui (Radix UI + `class-variance-authority`) instalado como
  código propio en `shared/components/ui/`, con `sonner` para toasts
- `lucide-react` para iconos
- `next-themes` + variables CSS en `styles/globals.css` para dark/light
  mode y re-tematización por cliente (`--color-primary` inicializado
  con `__THEME_PRIMARY__`)
- Vitest + React Testing Library + `msw` para tests
- Docker (build `standalone`) + nginx como reverse proxy
- GitHub Actions para CI

## Estructura de carpetas (feature-based)

```
templates/nextjs-react/
  src/
    app/
      (auth)/
        login/page.tsx
      dashboard/page.tsx
      api/auth/[...]/route.ts   # route handlers proxy (login/logout)
      layout.tsx
      middleware.ts             # protege rutas leyendo la cookie httpOnly
      error.tsx
      global-error.tsx
    features/
      auth/
        components/
        hooks/
        api.ts
        types.ts
      dashboard/
        components/
        hooks/
        api.ts
        types.ts
    shared/
      components/
        ui/                     # primitivos shadcn/ui
      hooks/
      lib/                      # cliente http, config de TanStack Query, utils
      stores/                   # stores de Zustand
      types/
    styles/
      globals.css                # tokens/variables CSS del tema
  Dockerfile
  docker-compose.yml
  nginx.conf
  .github/workflows/ci.yml
  .env.example                   # API_BASE_URL=__API_BASE_URL__
  package.json                   # name: "__PROJECT_NAME__"
  README.md
```

`features/*` es autocontenida (UI, hooks, capa de API, tipos) y no se
importa entre sí. `shared/` es lo transversal. La regla de componentes
genéricos del `CLAUDE.md` raíz se aplica a `shared/components/`: sin
lógica de negocio, sin imports de `features/`, configurables por props.

## Theming

- `next-themes` maneja el toggle claro/oscuro con persistencia
- `styles/globals.css` centraliza las variables CSS del tema,
  consumidas por `tailwind.config`; `--color-primary` se inicializa con
  el placeholder `__THEME_PRIMARY__` para que el CLI lo complete por
  cliente sin tocar componentes

## Autenticación

- `POST /api/auth/login` (route handler) recibe credenciales, llama a
  la API externa (`process.env.API_BASE_URL`, inyectada desde
  `.env.example` → `__API_BASE_URL__`), y si es exitoso setea el token
  en una cookie (`HttpOnly`, `Secure`, `SameSite=Lax`)
- `middleware.ts` lee la cookie en rutas protegidas y redirige a
  `/login` si falta o es inválida
- Las llamadas del cliente a la API externa pasan siempre por rutas
  internas de Next.js, que reenvían el token desde la cookie
- `POST /api/auth/logout` limpia la cookie
- CSRF token en los route handlers que mutan estado (login/logout)
- `useAuthStore` (Zustand) guarda solo estado derivado de UI (datos de
  usuario, `isAuthenticated`); el token nunca llega al JS de cliente

## Data fetching y manejo de errores

- Cliente HTTP centralizado en `shared/lib/http.ts`: agrega headers,
  maneja `401` (redirige a login), normaliza errores a
  `{ status, message, details }`
- `features/*/api.ts` expone funciones tipadas sobre ese cliente,
  consumidas vía hooks de TanStack Query (`useQuery`/`useMutation`)
- `app/error.tsx` + `app/global-error.tsx` para errores no controlados
- Errores de mutación se notifican con `sonner`

## Testing

- Vitest + React Testing Library, tests co-ubicados
  (`Component.test.tsx` junto a `Component.tsx`)
- `vitest.setup.ts` con mocks base (`matchMedia` para `next-themes`)
- `msw` mockea la API externa en tests de hooks/`api.ts`
- Ejemplo de test en cada capa: un componente `shared/components/ui`,
  un hook de una feature, una función de `api.ts`

## CI/CD y despliegue

- `.github/workflows/ci.yml`: install (pnpm, cache) → lint → typecheck
  (`tsc --noEmit`) → test → build, en push/PR a `main`
- `Dockerfile` multi-stage (`deps` → `builder` → `runner`, output
  `standalone`)
- `nginx.conf` de ejemplo como reverse proxy (gzip, headers de
  seguridad básicos, `proxy_pass` al contenedor de Next.js)
- `docker-compose.yml` para levantar Next.js + nginx juntos localmente

## Fuera de alcance

- Base de datos / ORM (esta plantilla es solo frontend + proxy de auth)
- Internacionalización (i18n)
- Plantilla de Angular — sub-proyecto separado, diseño aparte

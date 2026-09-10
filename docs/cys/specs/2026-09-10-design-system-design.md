# Design System completo — Diseño

**Fecha:** 2026-09-10
**Estado:** Aprobado, pendiente de implementación

## Contexto

Hoy `templates/nextjs-react/src/shared/components/ui/` tiene un solo
primitivo (`Button`), patrón shadcn/ui (Radix + `class-variance-authority`
+ Tailwind). `globals.css` define un set mínimo de tokens
(`--color-primary`, `-primary-foreground`, `-background`, `-foreground`,
`-input`, `-accent`, `-ring`). El usuario pidió un design system completo:
todos los primitivos de UI que el template va a necesitar, no solo los
que ya se usaron en Header/Dashboard.

Alcance confirmado explícitamente por el usuario: **los 17 componentes de
una sola vez** (no se recorta a un primer tramo), incluyendo instalar **10
paquetes Radix nuevos** (confirmado).

## Decisión de arquitectura

1. **Ampliar tokens antes que componentes** — varios componentes (Badge,
   Card, estados de error) necesitan colores que hoy no existen
   (`border`, `muted`, `card`, `destructive`, `success`, `warning`). Se
   agregan a `globals.css` siguiendo la convención estándar de shadcn/ui,
   ya parcialmente adoptada por este proyecto — no se inventa un esquema
   propio.
2. **Radix solo donde hay estado/accesibilidad real** (foco, teclado,
   apertura/cierre, roles ARIA); markup Tailwind + CVA simple para lo
   puramente presentacional (Badge, Card, Skeleton, Empty state, Table).
   Mismo criterio que ya se aplicó al decidir que `Header` no necesita
   Radix pero `Button` sí usa `@radix-ui/react-slot`.
3. **Toast no es un componente nuevo** — `sonner` ya está instalado y
   wireado en `providers.tsx`. La tarea es tematizar su `<Toaster>` con
   los tokens de este spec (variantes success/error/warning), no
   reconstruirlo.
4. **`Button` gana una variante de tamaño `icon`** (cuadrado, sin padding
   de texto) en vez de crear un "Icon button" separado — ya se usa como
   botón-ícono en `theme-toggle.tsx` y `header actions`, solo le falta el
   tamaño cuadrado correcto.
5. **`theme-toggle.tsx` pasa de botón binario a selector de 3 vías** —
   Claro / Oscuro / Sistema, requisito explícito del usuario. Mismo
   nombre de export (`ThemeToggle`), mismo lugar de uso (`page.tsx`), pero
   por dentro pasa de un solo `<Button onClick>` a un `DropdownMenu` con
   las 3 opciones llamando a `setTheme('light' | 'dark' | 'system')` de
   `next-themes`. Esto es la primera aplicación real del `dropdown-menu.tsx`
   de este mismo spec.

## Tokens nuevos en `globals.css`

Los tokens semánticos (`destructive`/`success`/`warning`) son sólidos y
autocontenidos — mantienen el mismo valor en claro y oscuro (mismo patrón
que un badge de error se ve igual en ambos temas). Los neutros
(`border`/`muted`/`card`) sí cambian por tema.

```css
:root {
  /* ya existentes: --color-primary, -primary-foreground, -background,
     -foreground, -input, -accent, -ring */
  --color-border: var(--color-input);
  --color-muted: var(--color-accent);
  --color-muted-foreground: #71717a;
  --color-card: #fafafa;
  --color-card-foreground: var(--color-foreground);
  --color-destructive: #b91c1c;
  --color-destructive-foreground: #ffffff;
  --color-success: #15803d;
  --color-success-foreground: #ffffff;
  --color-warning: #b45309;
  --color-warning-foreground: #ffffff;
}

.dark {
  /* ya existentes: --color-background, -foreground, -input, -accent */
  --color-muted-foreground: #a1a1aa;
  --color-card: #18181b;
  /* destructive/success/warning: mismo valor que :root, no se repiten */
}
```

`tailwind.config.ts` mapea cada uno igual que los tokens existentes
(`colors.border`, `colors.muted.DEFAULT/foreground`, `colors.card.DEFAULT/
foreground`, `colors.destructive.DEFAULT/foreground`, etc.).

## Dependencias nuevas

10 confirmadas (dependencies, runtime):

```
@radix-ui/react-label
@radix-ui/react-select
@radix-ui/react-checkbox
@radix-ui/react-radio-group
@radix-ui/react-switch
@radix-ui/react-tooltip
@radix-ui/react-tabs
@radix-ui/react-dialog
@radix-ui/react-avatar
@radix-ui/react-dropdown-menu
```

1 pendiente de confirmar (devDependency, plugin de Tailwind, agregada por
el requisito de "premium" — ver sección de Calidad visual):

```
tailwindcss-animate
```

## Calidad visual ("premium")

Traducido a requisitos concretos y verificables, no a un adjetivo:

- **Tipografía consistente** — una sola escala reutilizada por todos los
  componentes (no cada uno inventa su propio tamaño/peso):
  - Título de componente (ej. header de `Card`, `Dialog`): `text-base
    font-semibold tracking-tight` (mismo tratamiento que el `Header` ya
    construido).
  - Texto de control/label (`Label`, item de menú, tab, opción de
    `Select`): `text-sm font-medium`.
  - Texto secundario/ayuda (helper text de `Input`, descripción de
    `EmptyState`, `CardFooter`): `text-sm text-muted-foreground`.
  - Máximo 2 pesos por componente (regular/medium o medium/semibold) —
    nunca 3+ pesos mezclados.
- **Íconos donde aportan, no decorativos porque sí** — todos
  `lucide-react`, tamaño `h-4 w-4` consistente:
  - `Select`: chevron de apertura (`ChevronDown`).
  - `Checkbox`: check (`Check`) al estar marcado.
  - `DropdownMenu`: cada item de acción lleva su ícono a la izquierda
    (ej. `Settings`, `LogOut` — mismos que ya se usarán en Profile).
  - `Input`: slot opcional de ícono a la izquierda (prop `icon?`).
  - `EmptyState`: ícono recibido por prop (el componente no elige uno
    por sí mismo).
  - `Badge`/`Skeleton`/`Table`: sin íconos — no aportan ahí.
- **Transiciones en los flotantes** — `Dialog`, `DropdownMenu`, `Select`,
  `Tooltip` y `Tabs` deben abrir/cerrar con una transición corta
  (fade + scale sutil, ~150ms), usando los atributos `data-state` que
  Radix ya expone. Esto requiere **una dependencia nueva, número 11**:
  `tailwindcss-animate` (plugin de Tailwind, no un paquete Radix) — el
  mismo plugin que shadcn/ui usa por defecto para este propósito.
- **Elevación consistente** — reusar la escala ya iniciada por `Header`
  (`shadow-sm`): overlays (`Dialog`, `DropdownMenu`, `Select`, `Tooltip`)
  usan `shadow-md`; nada usa una sombra más pesada que esa.

## Componentes

Todos en `src/shared/components/ui/`, generic (sin lógica de negocio, sin
imports de `features/`), colocados con su test, siguiendo exactamente el
patrón de `button.tsx`/`button.test.tsx`.

| Archivo | Radix | Variantes / props clave |
|---|---|---|
| `button.tsx` (modificar) | `react-slot` (ya) | agregar `size: "icon"` (cuadrado) a la CVA existente |
| `label.tsx` | `react-label` | asociado a un control vía `htmlFor` |
| `input.tsx` | — (nativo) | `default` / `disabled` / `aria-invalid` (borde `destructive`) |
| `select.tsx` | `react-select` | trigger + content + item, estados open/disabled |
| `checkbox.tsx` | `react-checkbox` | checked/unchecked/disabled |
| `radio-group.tsx` | `react-radio-group` | grupo + item, checked/disabled |
| `switch.tsx` | `react-switch` | on/off/disabled |
| `tooltip.tsx` | `react-tooltip` | provider + trigger + content |
| `tabs.tsx` | `react-tabs` | list + trigger + content, active/hover |
| `dialog.tsx` | `react-dialog` | trigger + overlay + content (header/body/footer vía composición, no props obligatorios) |
| `avatar.tsx` | `react-avatar` | imagen + fallback (iniciales) |
| `dropdown-menu.tsx` | `react-dropdown-menu` | trigger + content + item + separator |
| `badge.tsx` | — | `variant: default \| success \| warning \| destructive` |
| `card.tsx` | — | subcomponentes `Card`, `CardHeader`, `CardContent`, `CardFooter` (composición, como shadcn) |
| `table.tsx` | — | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — fila con estado hover/selected |
| `skeleton.tsx` | — | `<Skeleton className>` con animación `pulse`, sin variantes |
| `empty-state.tsx` | — | props `icon` (`React.ReactNode`), `title`, `description?`, `action?` (reutiliza `Button` para el CTA) |
| `theme-toggle.tsx` (modificar) | consume `dropdown-menu.tsx` | Claro/Oscuro/Sistema vía `setTheme()` de `next-themes`; ítem activo marcado con `Check`; ícono del trigger según tema resuelto (`Sun`/`Moon`/`Monitor`) |

## Toast (tematizar, no construir)

En `providers.tsx`, pasar `toastOptions`/`classNames` al `<Toaster>` ya
existente para que use `--color-card`, `--color-border`,
`--color-destructive` y `--color-success` en vez de los defaults de
`sonner`. Sin archivo nuevo.

## Testing

- Cada componente: test de comportamiento accesible (rol, texto, estado
  abierto/cerrado, checked/unchecked), no de clases CSS exactas — mismo
  criterio que `button.test.tsx`/`theme-toggle.test.tsx`.
- `button.test.tsx`: agregar un caso para el nuevo tamaño `icon`.
- `theme-toggle.test.tsx`: se reescribe — el test actual asume un botón
  binario con click único; el nuevo verifica que las 3 opciones
  (Light/Dark/System) aparecen en el menú y que seleccionar cada una
  llama a `setTheme` con el valor correcto.
- `providers.test.tsx`: sin cambios obligatorios (ya verifica que
  `Providers` renderiza; tematizar el `Toaster` no cambia su contrato
  público).

## Manejo de errores

No aplica a nivel de componente — son primitivos presentacionales/de
control. `input.tsx` expone `aria-invalid` para que el consumidor marque
error, pero no valida nada por sí mismo (validación es responsabilidad de
quien use el input, ej. un formulario en `features/`).

## Fuera de alcance

- Cualquier formulario o pantalla real que use estos primitivos (Sidebar,
  Profile, login) — son tareas separadas que consumirán estos
  componentes después.
- Iconografía dentro de cada componente más allá de lo genérico (ej.
  `empty-state` recibe el ícono como prop, no lo elige por sí mismo).
- Personalización de `sonner` más allá de los 4 tokens de color listados.

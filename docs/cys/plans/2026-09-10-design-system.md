# Design System Implementation Plan

> **For agentic workers:** execute this plan with the
> parallel-plan-executor Workflow (cys:run / the /cys:run-plan command).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete UI design system for `templates/nextjs-react/`:
expand the CSS token set, add 16 new primitives to `shared/components/ui/`,
theme the existing `sonner` toaster, and upgrade `ThemeToggle` to a
Light/Dark/System selector — per `docs/cys/specs/2026-09-10-design-system-design.md`.

**Architecture:** Radix UI primitives + `class-variance-authority` (CVA) +
Tailwind, wherever a component has real interactive state or accessibility
requirements (focus, keyboard, open/close, ARIA roles); plain Tailwind + CVA
markup for purely presentational pieces (Badge, Card, Table, Skeleton,
EmptyState). Every component consumes the token set expanded in Task 1.
Overlay components (Select, Tooltip, Dialog, DropdownMenu) use the
`tailwindcss-animate` plugin for open/close transitions via Radix's
`data-state` attributes.

**Tech Stack:** Next.js (App Router), TypeScript (`strict: true`), Tailwind
CSS 3.4 + `tailwindcss-animate`, Radix UI (`@radix-ui/react-label`, `-select`,
`-checkbox`, `-radio-group`, `-switch`, `-tooltip`, `-tabs`, `-dialog`,
`-avatar`, `-dropdown-menu` — all new), `lucide-react`, `next-themes`,
`sonner` (existing), Vitest + React Testing Library.

## Global Constraints

- All paths in this plan are relative to `templates/nextjs-react/` inside
  the monorepo. Every shell command runs from the monorepo root and
  references that prefix explicitly.
- Import shared/local modules via the `@/*` → `./src/*` alias.
- Never hardcode style values — only Tailwind utility classes backed by the
  CSS variables this plan defines in `globals.css`.
- `shared/components/` stays generic: no business logic, no imports from
  `features/`.
- Every task that runs tests starts with `pnpm -C templates/nextjs-react
  install` in its own worktree (dependencies are gitignored).
- Test commands target exact file paths, never directories.
- Conventional Commit messages in English.
- Tests assert accessible behavior (role, text, checked/open state), never
  exact CSS classes — except where a task explicitly says otherwise
  (Button's size classes, Badge's variant classes: same precedent already
  set by `button.test.tsx`'s `toHaveClass('bg-primary')`).
- New dependencies this plan installs, one `pnpm add` per task that
  actually needs it (never install a package a task doesn't use itself):
  `@radix-ui/react-label`, `@radix-ui/react-select`,
  `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`,
  `@radix-ui/react-switch`, `@radix-ui/react-tooltip`, `@radix-ui/react-tabs`,
  `@radix-ui/react-dialog`, `@radix-ui/react-avatar`,
  `@radix-ui/react-dropdown-menu` (dependencies), `tailwindcss-animate`
  (devDependency, installed by Task 1 only).

---

### Task 1: Design tokens, Tailwind plugin, and Radix test polyfills

**Files:**
- Modify: `templates/nextjs-react/src/styles/globals.css`
- Modify: `templates/nextjs-react/tailwind.config.ts`
- Modify: `templates/nextjs-react/vitest.setup.ts`
- Modify: `templates/nextjs-react/package.json`
- Test: `templates/nextjs-react/tests/design-tokens.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `designTokens`

Steps:

1. Install dependencies in this worktree, then add the new devDependency:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add -D tailwindcss-animate
```

2. Write the failing test:

```js
// templates/nextjs-react/tests/design-tokens.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('globals.css declares the expanded design-system token set', () => {
  const css = readFileSync(new URL('../src/styles/globals.css', import.meta.url), 'utf8');
  const tokens = [
    '--color-border',
    '--color-muted',
    '--color-muted-foreground',
    '--color-card',
    '--color-card-foreground',
    '--color-destructive',
    '--color-destructive-foreground',
    '--color-success',
    '--color-success-foreground',
    '--color-warning',
    '--color-warning-foreground',
  ];
  for (const token of tokens) {
    assert.match(css, new RegExp(`${token}:`), `missing token ${token}`);
  }
});
```

3. Run it, expect FAIL:

```
node --test templates/nextjs-react/tests/design-tokens.test.mjs
```
Expected error: assertion failure — none of the new tokens exist yet.

4. Write the minimal implementation.

`templates/nextjs-react/src/styles/globals.css` (full file):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: __THEME_PRIMARY__;
  --color-primary-foreground: #ffffff;
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-input: #e5e7eb;
  --color-accent: #f3f4f6;
  --color-ring: var(--color-primary);
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
  --color-background: #0a0a0a;
  --color-foreground: #ededed;
  --color-input: #27272a;
  --color-accent: #27272a;
  --color-muted-foreground: #a1a1aa;
  --color-card: #18181b;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

`templates/nextjs-react/tailwind.config.ts` (full file):
```ts
import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        input: 'var(--color-input)',
        accent: 'var(--color-accent)',
        ring: 'var(--color-ring)',
        border: 'var(--color-border)',
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
```

`templates/nextjs-react/vitest.setup.ts` — append at the end of the existing
file (after the `matchMedia` polyfill block), Radix primitives need these in
jsdom:
```ts
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
```

`templates/nextjs-react/package.json` — update the `test` script to include
the new node:test file (only this one line changes):
```json
"test": "vitest run && node --test tests/root-config.test.mjs tests/deploy-config.test.mjs tests/design-tokens.test.mjs",
```

5. Run the test, expect PASS:

```
node --test templates/nextjs-react/tests/design-tokens.test.mjs
```

6. Commit:

```
git add templates/nextjs-react/src/styles/globals.css templates/nextjs-react/tailwind.config.ts templates/nextjs-react/vitest.setup.ts templates/nextjs-react/package.json templates/nextjs-react/tests/design-tokens.test.mjs templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: expand design tokens and add Radix/animate tooling"
```

---

### Task 2: `Button` — add the `icon` size variant

**Files:**
- Modify: `templates/nextjs-react/src/shared/components/ui/button.tsx`
- Modify: `templates/nextjs-react/src/shared/components/ui/button.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: None

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test — add this case to the existing file, inside the
existing `describe('Button', ...)` block:

```tsx
  it('applies square dimensions for the icon size', () => {
    render(<Button size="icon" aria-label="Icon action" />);

    const button = screen.getByRole('button', { name: 'Icon action' });
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('w-10');
  });
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/button.test.tsx
```
Expected error: `size="icon"` is not a valid variant yet (TypeScript error /
class not applied — the button falls back to no size classes).

4. Write the minimal implementation — add one line to the existing `size`
variants in `button.tsx`:

```tsx
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
```

(rest of `button.tsx` unchanged)

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/button.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/button.tsx templates/nextjs-react/src/shared/components/ui/button.test.tsx
git commit -m "feat: add icon size variant to Button"
```

---

### Task 3: `Label`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/label.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/label.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Label`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-label
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/label.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from './label';

describe('Label', () => {
  it('associates with a control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/label.test.tsx
```
Expected error: `Cannot find module './label'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/label.tsx
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/label.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/label.tsx templates/nextjs-react/src/shared/components/ui/label.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Label primitive"
```

---

### Task 4: `Input`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/input.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/input.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Input`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/input.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Search } from 'lucide-react';
import { Input } from './input';

describe('Input', () => {
  it('accepts typed input', async () => {
    render(<Input placeholder="Search" />);

    await userEvent.type(screen.getByPlaceholderText('Search'), 'hello');

    expect(screen.getByPlaceholderText('Search')).toHaveValue('hello');
  });

  it('marks itself invalid via aria-invalid', () => {
    render(<Input aria-invalid placeholder="Email" />);

    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders a leading icon when passed', () => {
    render(<Input icon={<Search data-testid="search-icon" />} placeholder="Search" />);

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/input.test.tsx
```
Expected error: `Cannot find module './input'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/input.tsx
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const baseInputClasses =
  'flex h-10 w-full rounded-md border border-input bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (!icon) {
      return <input ref={ref} className={cn(baseInputClasses, 'px-3 py-2', className)} {...props} />;
    }

    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          {icon}
        </span>
        <input ref={ref} className={cn(baseInputClasses, 'py-2 pl-9 pr-3', className)} {...props} />
      </div>
    );
  }
);
Input.displayName = 'Input';
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/input.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/input.tsx templates/nextjs-react/src/shared/components/ui/input.test.tsx
git commit -m "feat: add Input primitive"
```

---

### Task 5: `Select`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/select.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/select.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Select`
- Produces: `SelectValue`
- Produces: `SelectTrigger`
- Produces: `SelectContent`
- Produces: `SelectItem`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-select
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/select.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

describe('Select', () => {
  it('opens and selects an option', async () => {
    const onValueChange = vi.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
        </SelectContent>
      </Select>
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Option B'));

    expect(onValueChange).toHaveBeenCalledWith('b');
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/select.test.tsx
```
Expected error: `Cannot find module './select'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/select.tsx
'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/select.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/select.tsx templates/nextjs-react/src/shared/components/ui/select.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Select primitive"
```

---

### Task 6: `Checkbox`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/checkbox.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/checkbox.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Checkbox`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-checkbox
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/checkbox.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('toggles checked state when clicked', async () => {
    render(<Checkbox aria-label="Accept terms" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/checkbox.test.tsx
```
Expected error: `Cannot find module './checkbox'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/checkbox.tsx
'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/checkbox.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/checkbox.tsx templates/nextjs-react/src/shared/components/ui/checkbox.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Checkbox primitive"
```

---

### Task 7: `RadioGroup`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/radio-group.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/radio-group.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `RadioGroup`
- Produces: `RadioGroupItem`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-radio-group
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/radio-group.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroup', () => {
  it('selects one option at a time', async () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>
    );

    const optionB = screen.getByRole('radio', { name: 'Option B' });
    await userEvent.click(optionB);

    expect(optionB).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Option A' })).not.toBeChecked();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/radio-group.test.tsx
```
Expected error: `Cannot find module './radio-group'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/radio-group.tsx
'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-2', className)} {...props} />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'aspect-square h-4 w-4 rounded-full border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className="h-2 w-2 fill-current text-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/radio-group.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/radio-group.tsx templates/nextjs-react/src/shared/components/ui/radio-group.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add RadioGroup primitive"
```

---

### Task 8: `Switch`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/switch.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/switch.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Switch`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-switch
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/switch.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Switch } from './switch';

describe('Switch', () => {
  it('toggles on and off when clicked', async () => {
    render(<Switch aria-label="Enable notifications" />);

    const toggle = screen.getByRole('switch', { name: 'Enable notifications' });
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).toBeChecked();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/switch.test.tsx
```
Expected error: `Cannot find module './switch'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/switch.tsx
'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/shared/lib/utils';

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/switch.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/switch.tsx templates/nextjs-react/src/shared/components/ui/switch.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Switch primitive"
```

---

### Task 9: `Tooltip`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/tooltip.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/tooltip.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Tooltip`
- Produces: `TooltipTrigger`
- Produces: `TooltipContent`
- Produces: `TooltipProvider`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-tooltip
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/tooltip.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

describe('Tooltip', () => {
  it('shows its content on hover', async () => {
    render(
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Helpful hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await userEvent.hover(screen.getByText('Hover me'));

    expect(await screen.findByText('Helpful hint')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/tooltip.test.tsx
```
Expected error: `Cannot find module './tooltip'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/tooltip.tsx
'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/shared/lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md border border-border bg-card px-3 py-1.5 text-sm text-card-foreground shadow-md data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/tooltip.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/tooltip.tsx templates/nextjs-react/src/shared/components/ui/tooltip.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Tooltip primitive"
```

---

### Task 10: `Tabs`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/tabs.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/tabs.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Tabs`
- Produces: `TabsList`
- Produces: `TabsTrigger`
- Produces: `TabsContent`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-tabs
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/tabs.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

describe('Tabs', () => {
  it('switches content when a different tab is selected', async () => {
    render(
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>
    );

    expect(screen.getByText('First panel')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: 'Two' }));

    expect(await screen.findByText('Second panel')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/tabs.test.tsx
```
Expected error: `Cannot find module './tabs'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/tabs.tsx
'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/shared/lib/utils';

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex h-10 items-center rounded-md bg-muted p-1', className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-2 focus-visible:outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/tabs.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/tabs.tsx templates/nextjs-react/src/shared/components/ui/tabs.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Tabs primitive"
```

---

### Task 11: `Dialog`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/dialog.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/dialog.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Dialog`
- Produces: `DialogTrigger`
- Produces: `DialogContent`
- Produces: `DialogHeader`
- Produces: `DialogTitle`
- Produces: `DialogDescription`
- Produces: `DialogFooter`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-dialog
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/dialog.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './dialog';

describe('Dialog', () => {
  it('opens and shows its content when the trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Confirm</DialogTitle>
          <DialogDescription>Are you sure?</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await userEvent.click(screen.getByText('Open'));

    expect(await screen.findByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/dialog.test.tsx
```
Expected error: `Cannot find module './dialog'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/dialog.tsx
'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-card p-6 text-card-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1.5', className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-base font-semibold tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/dialog.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/dialog.tsx templates/nextjs-react/src/shared/components/ui/dialog.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Dialog primitive"
```

---

### Task 12: `Avatar`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/avatar.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/avatar.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Avatar`
- Produces: `AvatarImage`
- Produces: `AvatarFallback`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-avatar
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/avatar.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('renders the fallback initials', () => {
    render(
      <Avatar>
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByText('AD')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/avatar.test.tsx
```
Expected error: `Cannot find module './avatar'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/avatar.tsx
'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/shared/lib/utils';

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/avatar.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/avatar.tsx templates/nextjs-react/src/shared/components/ui/avatar.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add Avatar primitive"
```

---

### Task 13: `DropdownMenu`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/dropdown-menu.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/dropdown-menu.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `DropdownMenu`
- Produces: `DropdownMenuTrigger`
- Produces: `DropdownMenuContent`
- Produces: `DropdownMenuItem`
- Produces: `DropdownMenuSeparator`
- Produces: `DropdownMenuRadioGroup`
- Produces: `DropdownMenuRadioItem`

Steps:

1. Install dependencies and the Radix package this task needs:

```
pnpm -C templates/nextjs-react install
pnpm -C templates/nextjs-react add @radix-ui/react-dropdown-menu
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/dropdown-menu.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  it('opens and calls onSelect when an item is chosen', async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await userEvent.click(screen.getByText('Open menu'));
    await userEvent.click(await screen.findByText('Log out'));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/dropdown-menu.test.tsx
```
Expected error: `Cannot find module './dropdown-menu'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/dropdown-menu.tsx
'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/dropdown-menu.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/dropdown-menu.tsx templates/nextjs-react/src/shared/components/ui/dropdown-menu.test.tsx templates/nextjs-react/package.json templates/nextjs-react/pnpm-lock.yaml
git commit -m "feat: add DropdownMenu primitive"
```

---

### Task 14: `Badge`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/badge.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/badge.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Badge`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/badge.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders its text and applies the default variant class', () => {
    render(<Badge>New</Badge>);

    expect(screen.getByText('New')).toHaveClass('bg-primary');
  });

  it('applies the destructive variant class when requested', () => {
    render(<Badge variant="destructive">Error</Badge>);

    expect(screen.getByText('Error')).toHaveClass('bg-destructive');
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/badge.test.tsx
```
Expected error: `Cannot find module './badge'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/badge.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/badge.tsx templates/nextjs-react/src/shared/components/ui/badge.test.tsx
git commit -m "feat: add Badge primitive"
```

---

### Task 15: `Card`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/card.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/card.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Card`
- Produces: `CardHeader`
- Produces: `CardTitle`
- Produces: `CardDescription`
- Produces: `CardContent`
- Produces: `CardFooter`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/card.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

describe('Card', () => {
  it('renders its title, description, and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>Usage this month</CardDescription>
        </CardHeader>
        <CardContent>4.2 GB used</CardContent>
      </Card>
    );

    expect(screen.getByRole('heading', { name: 'Storage' })).toBeInTheDocument();
    expect(screen.getByText('Usage this month')).toBeInTheDocument();
    expect(screen.getByText('4.2 GB used')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/card.test.tsx
```
Expected error: `Cannot find module './card'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/card.tsx
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md border border-border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-2 p-6 pt-0', className)} {...props} />;
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/card.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/card.tsx templates/nextjs-react/src/shared/components/ui/card.test.tsx
git commit -m "feat: add Card primitive"
```

---

### Task 16: `Table`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/table.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/table.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Table`
- Produces: `TableHeader`
- Produces: `TableBody`
- Produces: `TableRow`
- Produces: `TableHead`
- Produces: `TableCell`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/table.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

describe('Table', () => {
  it('renders headers and row data, marking a selected row', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow selected data-testid="row">
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByTestId('row')).toHaveAttribute('data-state', 'selected');
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/table.test.tsx
```
Expected error: `Cannot find module './table'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/table.tsx
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('[&_tr]:border-b [&_tr]:border-border', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export function TableRow({ className, selected, ...props }: TableRowProps) {
  return (
    <tr
      data-state={selected ? 'selected' : undefined}
      className={cn(
        'border-b border-border transition-colors hover:bg-muted data-[state=selected]:bg-accent',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn('h-10 px-2 text-left align-middle text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-2 align-middle', className)} {...props} />;
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/table.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/table.tsx templates/nextjs-react/src/shared/components/ui/table.test.tsx
git commit -m "feat: add Table primitive"
```

---

### Task 17: `Skeleton`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/skeleton.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/skeleton.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `Skeleton`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/skeleton.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders a pulsing placeholder block', () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-24" />);

    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/skeleton.test.tsx
```
Expected error: `Cannot find module './skeleton'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/skeleton.tsx
import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/skeleton.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/skeleton.tsx templates/nextjs-react/src/shared/components/ui/skeleton.test.tsx
git commit -m "feat: add Skeleton primitive"
```

---

### Task 18: `EmptyState`

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/empty-state.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/empty-state.test.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: `EmptyState`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/empty-state.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Inbox } from 'lucide-react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders the title, description, and calls the action when clicked', async () => {
    const onClick = vi.fn();
    render(
      <EmptyState
        icon={<Inbox data-testid="icon" />}
        title="No messages"
        description="You're all caught up."
        action={{ label: 'Refresh', onClick }}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('No messages')).toBeInTheDocument();
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/empty-state.test.tsx
```
Expected error: `Cannot find module './empty-state'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/empty-state.tsx
import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 p-8 text-center', className)}>
      <div className="text-muted-foreground">{icon}</div>
      <p className="text-base font-semibold tracking-tight">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action ? (
        <Button size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/empty-state.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/empty-state.tsx templates/nextjs-react/src/shared/components/ui/empty-state.test.tsx
git commit -m "feat: add EmptyState primitive"
```

---

### Task 19: Theme the `sonner` toaster

**Files:**
- Modify: `templates/nextjs-react/src/shared/providers.tsx`

**Interfaces:**
- Consumes: `designTokens`
- Produces: None

Note: no test changes — `providers.test.tsx` only verifies `Providers`
renders its children, which is unaffected by theming the `<Toaster>`'s
visual classes. Sonner's own internals aren't something this project owns
to unit-test.

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. No new test — see note above.

3. N/A (no RED step for this task).

4. Write the implementation — replace the `<Toaster>` line in
`providers.tsx`:

```tsx
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-card text-card-foreground border border-border shadow-md',
              success: 'bg-success text-success-foreground border-success',
              error: 'bg-destructive text-destructive-foreground border-destructive',
              warning: 'bg-warning text-warning-foreground border-warning',
            },
          }}
        />
```

(`richColors` is removed — it applies sonner's own built-in color scheme,
which would fight with the `classNames` above; the rest of `providers.tsx`
is unchanged)

5. Run the existing test, expect PASS (unaffected):

```
pnpm -C templates/nextjs-react exec vitest run src/shared/providers.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/providers.tsx
git commit -m "style: theme the toast notifications with design-system tokens"
```

---

### Task 20: Upgrade `ThemeToggle` to a Light/Dark/System selector

**Files:**
- Modify: `templates/nextjs-react/src/shared/components/theme-toggle.tsx`
- Modify: `templates/nextjs-react/src/shared/components/theme-toggle.test.tsx`

**Interfaces:**
- Consumes: `DropdownMenu`
- Consumes: `DropdownMenuTrigger`
- Consumes: `DropdownMenuContent`
- Consumes: `DropdownMenuRadioGroup`
- Consumes: `DropdownMenuRadioItem`
- Produces: None

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test — replace the entire file (the old binary-toggle
test no longer matches the new behavior):

```tsx
// templates/nextjs-react/src/shared/components/theme-toggle.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('lists Light, Dark, and System options and switches to Dark when selected', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ThemeToggle />
      </ThemeProvider>
    );

    const trigger = await screen.findByRole('button', { name: 'Toggle theme' });
    await userEvent.click(trigger);

    expect(screen.getByRole('menuitemradio', { name: /Light/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /Dark/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: /System/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('menuitemradio', { name: /Dark/ }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/theme-toggle.test.tsx
```
Expected error: no `menuitemradio` roles found — the component still
renders a single toggle button, not a menu.

4. Write the minimal implementation — replace the entire file:

```tsx
// templates/nextjs-react/src/shared/components/theme-toggle.tsx
'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled />;
  }

  const TriggerIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <TriggerIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon className="h-4 w-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/theme-toggle.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/theme-toggle.tsx templates/nextjs-react/src/shared/components/theme-toggle.test.tsx
git commit -m "feat: upgrade ThemeToggle to a Light/Dark/System selector"
```

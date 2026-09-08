# Next.js/React Template Implementation Plan

> **For agentic workers:** execute this plan with the
> parallel-plan-executor Workflow (cys:run / the /cys:run-plan command).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `templates/nextjs-react/` template: a Next.js/React
frontend that consumes an external API, with auth, theming, testing,
CI and Docker/nginx deploy, ready for `pnpm create:project` to scaffold
from.

**Architecture:** Next.js App Router + TypeScript, feature-based
(`features/`, `shared/`). `shared/lib/http.ts` is the single HTTP
client every feature's `api.ts` uses; auth state lives in an
httpOnly cookie set by Next.js route handlers (never in client JS) and
mirrored as UI-only state in a Zustand store. UI primitives
(`shared/components/ui/`) follow the shadcn/ui pattern (Radix + CVA)
and are the only components features may treat as generic/reusable.

**Tech Stack:** Next.js (App Router), TypeScript (`strict: true`),
Tailwind CSS, TanStack Query, Zustand, shadcn/ui (Radix + CVA) +
sonner, lucide-react, next-themes, Vitest + React Testing Library +
msw, Docker (`standalone`) + nginx, GitHub Actions.

## Global Constraints

- All paths in this plan are relative to `templates/nextjs-react/`
  inside the monorepo (e.g. `package.json` means
  `templates/nextjs-react/package.json`). Every shell command below is
  written to run from the monorepo root and references that prefix
  explicitly.
- TypeScript `strict: true`. Import shared/local modules via the `@/*`
  → `./src/*` path alias once `vitest.config.ts` (Task 2) defines it
  for tests; `tsconfig.json` (Task 1) defines it for the app itself.
- Never hardcode style values (colors, spacing) in components — only
  Tailwind utility classes backed by the CSS variables in
  `src/styles/globals.css`.
- Files that the `pnpm create:project` CLI completes must keep the
  monorepo's placeholder tokens verbatim: `__PROJECT_NAME__` (in
  `package.json`, `README.md`, page metadata/copy), `__THEME_PRIMARY__`
  (in `src/styles/globals.css`), `__API_BASE_URL__` (in `.env.example`).
- Auth token lives only in an `HttpOnly`, `Secure`, `SameSite=Lax`
  cookie set by route handlers; client code never reads or stores the
  token itself.
- Every task that runs tests starts with `pnpm -C templates/nextjs-react
  install` in its own worktree (dependencies are gitignored, not
  committed, so each isolated worktree needs its own install).
- Test commands target exact file paths, never directories (passing a
  directory to this Node/pnpm/vitest setup does not glob reliably on
  Windows).
- Conventional Commit messages in English.

---

### Task 1: Project scaffold & config

**Files:**
- Create: `templates/nextjs-react/package.json`
- Create: `templates/nextjs-react/tsconfig.json`
- Create: `templates/nextjs-react/next.config.mjs`
- Create: `templates/nextjs-react/tailwind.config.ts`
- Create: `templates/nextjs-react/postcss.config.mjs`
- Create: `templates/nextjs-react/eslint.config.mjs`
- Create: `templates/nextjs-react/.prettierrc`
- Create: `templates/nextjs-react/.husky/pre-commit`
- Create: `templates/nextjs-react/.gitignore`
- Create: `templates/nextjs-react/.env.example`
- Create: `templates/nextjs-react/README.md`
- Test: `templates/nextjs-react/tests/root-config.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `package.json`

Steps:

1. Write the failing test:

```js
// templates/nextjs-react/tests/root-config.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('package.json declares required scripts and the placeholder name', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  assert.equal(pkg.name, '__PROJECT_NAME__');
  assert.equal(pkg.scripts.dev, 'next dev');
  assert.equal(pkg.scripts.build, 'next build');
  assert.equal(pkg.scripts.test, 'vitest run');
  assert.equal(pkg.scripts.typecheck, 'tsc --noEmit');
  assert.equal(pkg.scripts.lint, 'eslint .');
});
```

2. Run it, expect FAIL:

```
node --test templates/nextjs-react/tests/root-config.test.mjs
```
Expected error: `ENOENT: no such file or directory, open '...package.json'`

3. Write the minimal implementation.

`templates/nextjs-react/package.json`:
```json
{
  "name": "__PROJECT_NAME__",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "prepare": "husky"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.59.0",
    "zustand": "^5.0.0",
    "next-themes": "^0.4.0",
    "lucide-react": "^0.454.0",
    "sonner": "^1.7.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "@radix-ui/react-slot": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.3.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "@eslint/eslintrc": "^3.1.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^25.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/user-event": "^14.5.0",
    "msw": "^2.6.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

`templates/nextjs-react/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`templates/nextjs-react/next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

`templates/nextjs-react/tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

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
      },
    },
  },
  plugins: [],
};

export default config;
```

`templates/nextjs-react/postcss.config.mjs`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`templates/nextjs-react/eslint.config.mjs`:
```js
import { FlatCompat } from '@eslint/eslintrc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

export default [...compat.extends('next/core-web-vitals', 'next/typescript')];
```

`templates/nextjs-react/.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

`templates/nextjs-react/.husky/pre-commit`:
```
npx lint-staged
```

Note: `pnpm install` runs the `prepare` script (`husky`), which installs
this hook into `.git/hooks` — that only happens once the scaffolded
project has its own `.git` directory. `tools/create-project/setup.mjs`
(monorepo CLI) already runs `git init` before its own commit, but runs
`pnpm install` *before* `git init` — meaning the hook install is
silently skipped by design (husky v9 no-ops without a `.git` dir)
until the user runs `pnpm install` a second time, or `pnpm exec husky`
manually. Flagging this as a known follow-up for the monorepo's
`tools/create-project`, out of scope for this template's plan.

`templates/nextjs-react/.gitignore`:
```
node_modules/
.next/
out/
.env
.env.local
*.log
```

`templates/nextjs-react/.env.example`:
```
API_BASE_URL=__API_BASE_URL__
```

`templates/nextjs-react/README.md`:
```md
# __PROJECT_NAME__

Generado a partir de la plantilla `nextjs-react` del monorepo `template`.

## Desarrollo

    pnpm install
    pnpm dev

## Tests

    pnpm test

## Build & Docker

    pnpm build
    docker compose up --build
```

4. Run the test, expect PASS:

```
node --test templates/nextjs-react/tests/root-config.test.mjs
```

5. Commit:

```
git add templates/nextjs-react/package.json templates/nextjs-react/tsconfig.json templates/nextjs-react/next.config.mjs templates/nextjs-react/tailwind.config.ts templates/nextjs-react/postcss.config.mjs templates/nextjs-react/eslint.config.mjs templates/nextjs-react/.prettierrc templates/nextjs-react/.husky/pre-commit templates/nextjs-react/.gitignore templates/nextjs-react/.env.example templates/nextjs-react/README.md templates/nextjs-react/tests/root-config.test.mjs
git commit -m "chore: scaffold Next.js/React template config"
```

---

### Task 2: Testing setup (Vitest + RTL + msw)

**Files:**
- Create: `templates/nextjs-react/vitest.config.ts`
- Create: `templates/nextjs-react/vitest.setup.ts`
- Create: `templates/nextjs-react/tests/mocks/server.ts`
- Test: `templates/nextjs-react/tests/smoke.test.tsx`

**Interfaces:**
- Consumes: `package.json`
- Produces: `vitest.config.ts`
- Produces: `mswServer`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/tests/smoke.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('renders with jsdom and testing-library matchers', () => {
    render(<div>ready</div>);
    expect(screen.getByText('ready')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run tests/smoke.test.tsx
```
Expected error: `ReferenceError: document is not defined` (default
Vitest environment is `node`, no jsdom yet)

4. Write the minimal implementation.

`templates/nextjs-react/tests/mocks/server.ts`:
```ts
import { setupServer } from 'msw/node';

export const mswServer = setupServer();
```

`templates/nextjs-react/vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { mswServer } from './tests/mocks/server';

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  mswServer.resetHandlers();
});
afterAll(() => mswServer.close());

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
```

`templates/nextjs-react/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    env: {
      API_BASE_URL: 'https://api.test',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
});
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run tests/smoke.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/vitest.config.ts templates/nextjs-react/vitest.setup.ts templates/nextjs-react/tests/mocks/server.ts templates/nextjs-react/tests/smoke.test.tsx
git commit -m "test: add Vitest, React Testing Library, and msw setup"
```

---

### Task 3: `shared/lib/utils.ts` — `cn()` helper

**Files:**
- Create: `templates/nextjs-react/src/shared/lib/utils.ts`
- Test: `templates/nextjs-react/src/shared/lib/utils.test.ts`

**Interfaces:**
- Consumes: `package.json`
- Produces: `cn()`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```ts
// templates/nextjs-react/src/shared/lib/utils.test.ts
import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', false && 'hidden', 'font-bold')).toBe('text-sm font-bold');
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/lib/utils.test.ts
```
Expected error: `Cannot find module './utils'`

4. Write the minimal implementation:

```ts
// templates/nextjs-react/src/shared/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/lib/utils.test.ts
```

6. Commit:

```
git add templates/nextjs-react/src/shared/lib/utils.ts templates/nextjs-react/src/shared/lib/utils.test.ts
git commit -m "feat: add cn() class name merge helper"
```

---

### Task 4: `shared/lib/http.ts` — HTTP client

**Files:**
- Create: `templates/nextjs-react/src/shared/lib/http.ts`
- Test: `templates/nextjs-react/src/shared/lib/http.test.ts`

**Interfaces:**
- Consumes: `package.json`
- Produces: `apiFetch()`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```ts
// templates/nextjs-react/src/shared/lib/http.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiError } from './http';

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    );

    const result = await apiFetch<{ ok: boolean }>('/api/example');

    expect(result).toEqual({ ok: true });
  });

  it('throws a normalized ApiError on failure responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: 'Not found' }), { status: 404 })
      )
    );

    await expect(apiFetch('/api/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Not found',
    });
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/lib/http.test.ts
```
Expected error: `Cannot find module './http'`

4. Write the minimal implementation:

```ts
// templates/nextjs-react/src/shared/lib/http.ts
export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    window.location.assign('/login');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message ?? response.statusText, body?.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/lib/http.test.ts
```

6. Commit:

```
git add templates/nextjs-react/src/shared/lib/http.ts templates/nextjs-react/src/shared/lib/http.test.ts
git commit -m "feat: add centralized apiFetch HTTP client"
```

---

### Task 5: `shared/stores/auth-store.ts` — Zustand auth store

**Files:**
- Create: `templates/nextjs-react/src/shared/stores/auth-store.ts`
- Test: `templates/nextjs-react/src/shared/stores/auth-store.test.ts`

**Interfaces:**
- Consumes: `package.json`
- Produces: `useAuthStore()`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```ts
// templates/nextjs-react/src/shared/stores/auth-store.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearUser();
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setUser marks the store authenticated', () => {
    useAuthStore.getState().setUser({ id: '1', email: 'a@b.com', name: 'Ada' });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('a@b.com');
  });

  it('clearUser resets the store', () => {
    useAuthStore.getState().setUser({ id: '1', email: 'a@b.com', name: 'Ada' });
    useAuthStore.getState().clearUser();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/stores/auth-store.test.ts
```
Expected error: `Cannot find module './auth-store'`

4. Write the minimal implementation:

```ts
// templates/nextjs-react/src/shared/stores/auth-store.ts
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/stores/auth-store.test.ts
```

6. Commit:

```
git add templates/nextjs-react/src/shared/stores/auth-store.ts templates/nextjs-react/src/shared/stores/auth-store.test.ts
git commit -m "feat: add Zustand auth store for UI-only session state"
```

---

### Task 6: `shared/components/ui/button.tsx` — shadcn/ui Button

**Files:**
- Create: `templates/nextjs-react/src/shared/components/ui/button.tsx`
- Test: `templates/nextjs-react/src/shared/components/ui/button.test.tsx`

**Interfaces:**
- Consumes: `package.json`
- Consumes: `vitest.config.ts`
- Consumes: `cn()`
- Produces: `Button`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/ui/button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders children and applies the default variant class', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('bg-primary');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/button.test.tsx
```
Expected error: `Cannot find module './button'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        outline: 'border border-input bg-transparent hover:bg-accent',
        ghost: 'hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/ui/button.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/ui/button.tsx templates/nextjs-react/src/shared/components/ui/button.test.tsx
git commit -m "feat: add shadcn/ui Button primitive"
```

---

### Task 7: `shared/providers.tsx` — Theme + Query providers

**Files:**
- Create: `templates/nextjs-react/src/shared/providers.tsx`
- Test: `templates/nextjs-react/src/shared/providers.test.tsx`

**Interfaces:**
- Consumes: `package.json`
- Consumes: `vitest.config.ts`
- Produces: `Providers`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/providers.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Providers } from './providers';

describe('Providers', () => {
  it('renders children inside the theme and query providers', () => {
    render(
      <Providers>
        <span>content</span>
      </Providers>
    );

    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/providers.test.tsx
```
Expected error: `Cannot find module './providers'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/providers.tsx
'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(createQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/providers.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/providers.tsx templates/nextjs-react/src/shared/providers.test.tsx
git commit -m "feat: add theme and query client providers"
```

---

### Task 8: Root layout, home page, error boundaries, theme CSS

**Files:**
- Create: `templates/nextjs-react/src/app/layout.tsx`
- Create: `templates/nextjs-react/src/app/page.tsx`
- Create: `templates/nextjs-react/src/app/error.tsx`
- Create: `templates/nextjs-react/src/app/global-error.tsx`
- Create: `templates/nextjs-react/src/styles/globals.css`
- Create: `templates/nextjs-react/src/shared/components/theme-toggle.tsx`
- Test: `templates/nextjs-react/src/app/page.test.tsx`
- Test: `templates/nextjs-react/src/shared/components/theme-toggle.test.tsx`

**Interfaces:**
- Consumes: `Providers`
- Consumes: `Button`
- Produces: None

Note: `error.tsx`/`global-error.tsx` are Next.js framework-invoked
boundaries (triggered by the router, not imported by app code) — they
are covered by manual/E2E verification later, not a Vitest unit test,
same as Next.js's own convention for these files.

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';
import { Providers } from '@/shared/providers';

describe('HomePage', () => {
  it('renders the project name and a call-to-action button', () => {
    render(
      <Providers>
        <HomePage />
      </Providers>
    );

    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
  });
});
```

3. Run them, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/app/page.test.tsx src/shared/components/theme-toggle.test.tsx
```
Expected error: `Cannot find module './page'` / `Cannot find module './theme-toggle'`

Also write the toggle's test now, before its implementation:

```tsx
// templates/nextjs-react/src/shared/components/theme-toggle.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

describe('ThemeToggle', () => {
  it('toggles the theme when clicked', async () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = await screen.findByRole('button', { name: 'Toggle theme' });
    expect(button).not.toBeDisabled();

    await userEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
```

4. Write the minimal implementation.

`templates/nextjs-react/src/styles/globals.css`:
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
}

.dark {
  --color-background: #0a0a0a;
  --color-foreground: #ededed;
  --color-input: #27272a;
  --color-accent: #27272a;
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
}
```

`templates/nextjs-react/src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import { Providers } from '@/shared/providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '__PROJECT_NAME__',
  description: 'Generated from the nextjs-react template',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

`templates/nextjs-react/src/shared/components/theme-toggle.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Button variant="ghost" size="sm" aria-label="Toggle theme" disabled />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

`templates/nextjs-react/src/app/page.tsx`:
```tsx
import { Button } from '@/shared/components/ui/button';
import { ThemeToggle } from '@/shared/components/theme-toggle';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <h1 className="text-2xl font-bold">__PROJECT_NAME__</h1>
      <Button>Get started</Button>
    </main>
  );
}
```

`templates/nextjs-react/src/app/error.tsx`:
```tsx
'use client';

import { Button } from '@/shared/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">Something went wrong.</p>
      <p className="text-sm text-foreground/70">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

`templates/nextjs-react/src/app/global-error.tsx`:
```tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <p className="text-lg font-medium">A critical error occurred.</p>
          <p className="text-sm text-foreground/70">{error.message}</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  );
}
```

5. Run the tests, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/app/page.test.tsx src/shared/components/theme-toggle.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/app/layout.tsx templates/nextjs-react/src/app/page.tsx templates/nextjs-react/src/app/error.tsx templates/nextjs-react/src/app/global-error.tsx templates/nextjs-react/src/styles/globals.css templates/nextjs-react/src/shared/components/theme-toggle.tsx templates/nextjs-react/src/app/page.test.tsx templates/nextjs-react/src/shared/components/theme-toggle.test.tsx
git commit -m "feat: add root layout, home page, theme toggle, and error boundaries"
```

---

### Task 9: Auth backend — CSRF, login/logout route handlers, middleware

**Files:**
- Create: `templates/nextjs-react/src/shared/lib/csrf.ts`
- Create: `templates/nextjs-react/src/app/api/auth/csrf/route.ts`
- Create: `templates/nextjs-react/src/app/api/auth/login/route.ts`
- Create: `templates/nextjs-react/src/app/api/auth/logout/route.ts`
- Create: `templates/nextjs-react/src/middleware.ts`
- Test: `templates/nextjs-react/src/shared/lib/csrf.test.ts`
- Test: `templates/nextjs-react/src/app/api/auth/csrf/route.test.ts`
- Test: `templates/nextjs-react/src/app/api/auth/login/route.test.ts`
- Test: `templates/nextjs-react/src/app/api/auth/logout/route.test.ts`
- Test: `templates/nextjs-react/src/middleware.test.ts`

**Interfaces:**
- Consumes: `package.json`
- Consumes: `vitest.config.ts`
- Consumes: `mswServer`
- Consumes: `apiFetch()`
- Produces: `isValidCsrfToken()`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing tests:

```ts
// templates/nextjs-react/src/shared/lib/csrf.test.ts
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { isValidCsrfToken } from './csrf';

describe('isValidCsrfToken', () => {
  it('returns true when the header matches the cookie', () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { cookie: 'csrf_token=abc123', 'x-csrf-token': 'abc123' },
    });

    expect(isValidCsrfToken(request)).toBe(true);
  });

  it('returns false when the header is missing or does not match', () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { cookie: 'csrf_token=abc123' },
    });

    expect(isValidCsrfToken(request)).toBe(false);
  });
});
```

```ts
// templates/nextjs-react/src/app/api/auth/csrf/route.test.ts
import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/auth/csrf', () => {
  it('issues a CSRF token cookie and returns it in the body', async () => {
    const response = await GET();
    const body = await response.json();
    const cookie = response.cookies.get('csrf_token');

    expect(cookie?.value).toBe(body.csrfToken);
    expect(cookie?.httpOnly).toBe(false);
  });
});
```

```ts
// templates/nextjs-react/src/app/api/auth/login/route.test.ts
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { mswServer } from '../../../../../tests/mocks/server';
import { POST } from './route';

function requestWithCsrf(body: unknown) {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { cookie: 'csrf_token=valid-token', 'x-csrf-token': 'valid-token' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  it('rejects requests without a matching CSRF token', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('sets an httpOnly session cookie on success', async () => {
    mswServer.use(
      http.post('https://api.test/auth/login', () =>
        HttpResponse.json({ token: 'jwt-token', user: { id: '1', email: 'a@b.com' } })
      )
    );

    const response = await POST(requestWithCsrf({ email: 'a@b.com', password: 'secret' }));
    const cookie = response.cookies.get('session_token');

    expect(response.status).toBe(200);
    expect(cookie?.value).toBe('jwt-token');
    expect(cookie?.httpOnly).toBe(true);
  });

  it('forwards the external API error status and message on failure', async () => {
    mswServer.use(
      http.post('https://api.test/auth/login', () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      )
    );

    const response = await POST(requestWithCsrf({ email: 'a@b.com', password: 'wrong' }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe('Invalid credentials');
  });
});
```

```ts
// templates/nextjs-react/src/app/api/auth/logout/route.test.ts
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

describe('POST /api/auth/logout', () => {
  it('rejects requests without a matching CSRF token', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', { method: 'POST' });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('clears the session cookie when the CSRF token matches', async () => {
    const request = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: { cookie: 'csrf_token=valid-token', 'x-csrf-token': 'valid-token' },
    });

    const response = await POST(request);
    const cookie = response.cookies.get('session_token');

    expect(response.status).toBe(200);
    expect(cookie?.value).toBe('');
  });
});
```

```ts
// templates/nextjs-react/src/middleware.test.ts
import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

describe('middleware', () => {
  it('redirects to /login when accessing a protected route without a session cookie', () => {
    const request = new NextRequest('http://localhost/dashboard');

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/login');
  });

  it('allows the request through when a session cookie is present', () => {
    const request = new NextRequest('http://localhost/dashboard', {
      headers: { cookie: 'session_token=jwt-token' },
    });

    const response = middleware(request);

    expect(response.status).toBe(200);
  });
});
```

3. Run them, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/lib/csrf.test.ts src/app/api/auth/csrf/route.test.ts src/app/api/auth/login/route.test.ts src/app/api/auth/logout/route.test.ts src/middleware.test.ts
```
Expected error: `Cannot find module './csrf'` / `Cannot find module './route'` / `Cannot find module './middleware'`

4. Write the minimal implementation.

`templates/nextjs-react/src/shared/lib/csrf.ts`:
```ts
import { NextRequest } from 'next/server';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

export function isValidCsrfToken(request: NextRequest): boolean {
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);
  return Boolean(cookieToken) && cookieToken === headerToken;
}
```

`templates/nextjs-react/src/app/api/auth/csrf/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';

const CSRF_COOKIE = 'csrf_token';

export async function GET() {
  const token = randomUUID();
  const response = NextResponse.json({ csrfToken: token });
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
```

`templates/nextjs-react/src/app/api/auth/login/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFetch } from '@/shared/lib/http';
import { isValidCsrfToken } from '@/shared/lib/csrf';

const AUTH_COOKIE = 'session_token';

export async function POST(request: NextRequest) {
  if (!isValidCsrfToken(request)) {
    return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
  }

  const { email, password } = await request.json();

  try {
    const { token, user } = await apiFetch<{ token: string; user: unknown }>(
      `${process.env.API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
  }
}
```

`templates/nextjs-react/src/app/api/auth/logout/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { isValidCsrfToken } from '@/shared/lib/csrf';

const AUTH_COOKIE = 'session_token';

export async function POST(request: NextRequest) {
  if (!isValidCsrfToken(request)) {
    return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
```

`templates/nextjs-react/src/middleware.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'session_token';
const PROTECTED_PATHS = ['/dashboard'];

export function middleware(request: NextRequest) {
  const isProtected = PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE);
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

5. Run the tests, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/lib/csrf.test.ts src/app/api/auth/csrf/route.test.ts src/app/api/auth/login/route.test.ts src/app/api/auth/logout/route.test.ts src/middleware.test.ts
```

6. Commit:

```
git add templates/nextjs-react/src/shared/lib/csrf.ts templates/nextjs-react/src/app/api/auth/csrf/route.ts templates/nextjs-react/src/app/api/auth/login/route.ts templates/nextjs-react/src/app/api/auth/logout/route.ts templates/nextjs-react/src/middleware.ts templates/nextjs-react/src/shared/lib/csrf.test.ts templates/nextjs-react/src/app/api/auth/csrf/route.test.ts templates/nextjs-react/src/app/api/auth/login/route.test.ts templates/nextjs-react/src/app/api/auth/logout/route.test.ts templates/nextjs-react/src/middleware.test.ts
git commit -m "feat: add CSRF-protected auth route handlers and route-protection middleware"
```

---

### Task 10: Auth frontend — login page, hook, and API call

**Files:**
- Create: `templates/nextjs-react/src/features/auth/api.ts`
- Create: `templates/nextjs-react/src/features/auth/hooks/use-login.ts`
- Create: `templates/nextjs-react/src/app/(auth)/login/page.tsx`
- Test: `templates/nextjs-react/src/features/auth/hooks/use-login.test.tsx`

**Interfaces:**
- Consumes: `package.json`
- Consumes: `vitest.config.ts`
- Consumes: `useAuthStore()`
- Consumes: `Button`
- Produces: `useLogin()`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/features/auth/hooks/use-login.test.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useLogin } from './use-login';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useLogin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    useAuthStore.getState().clearUser();
  });

  it('stores the returned user on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ user: { id: '1', email: 'a@b.com', name: 'Ada' } }), {
            status: 200,
          })
      )
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'a@b.com', password: 'secret' });

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    expect(useAuthStore.getState().user?.email).toBe('a@b.com');
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/features/auth/hooks/use-login.test.tsx
```
Expected error: `Cannot find module './use-login'`

4. Write the minimal implementation.

`templates/nextjs-react/src/features/auth/api.ts`:
```ts
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const csrfResponse = await fetch('/api/auth/csrf');
  const { csrfToken } = await csrfResponse.json();

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Login failed');
  }

  return response.json();
}
```

`templates/nextjs-react/src/features/auth/hooks/use-login.ts`:
```ts
'use client';

import { useMutation } from '@tanstack/react-query';
import { login } from '@/features/auth/api';
import { useAuthStore } from '@/shared/stores/auth-store';

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}
```

`templates/nextjs-react/src/app/(auth)/login/page.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { useLogin } from '@/features/auth/hooks/use-login';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { mutate, isPending, error } = useLogin();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    mutate({ email, password }, { onSuccess: () => router.push('/dashboard') });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="rounded-md border border-input px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="rounded-md border border-input px-3 py-2"
        />
        {error ? <p className="text-sm text-red-500">{error.message}</p> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  );
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/features/auth/hooks/use-login.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/features/auth/api.ts templates/nextjs-react/src/features/auth/hooks/use-login.ts templates/nextjs-react/src/app/\(auth\)/login/page.tsx templates/nextjs-react/src/features/auth/hooks/use-login.test.tsx
git commit -m "feat: add login page, useLogin hook, and auth API call"
```

---

### Task 11: Dashboard feature (protected page)

**Files:**
- Create: `templates/nextjs-react/src/features/dashboard/api.ts`
- Create: `templates/nextjs-react/src/features/dashboard/hooks/use-dashboard.ts`
- Create: `templates/nextjs-react/src/app/dashboard/page.tsx`
- Test: `templates/nextjs-react/src/features/dashboard/hooks/use-dashboard.test.tsx`

**Interfaces:**
- Consumes: `package.json`
- Consumes: `vitest.config.ts`
- Consumes: `apiFetch()`
- Consumes: `Button`
- Produces: `useDashboard()`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/features/dashboard/hooks/use-dashboard.test.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDashboard } from './use-dashboard';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useDashboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the dashboard summary on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ totalItems: 3, lastUpdated: '2026-09-07' }), {
            status: 200,
          })
      )
    );

    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalItems).toBe(3);
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/features/dashboard/hooks/use-dashboard.test.tsx
```
Expected error: `Cannot find module './use-dashboard'`

4. Write the minimal implementation.

`templates/nextjs-react/src/features/dashboard/api.ts`:
```ts
import { apiFetch } from '@/shared/lib/http';

export interface DashboardSummary {
  totalItems: number;
  lastUpdated: string;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>('/api/dashboard/summary');
}
```

`templates/nextjs-react/src/features/dashboard/hooks/use-dashboard.ts`:
```ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '@/features/dashboard/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
  });
}
```

`templates/nextjs-react/src/app/dashboard/page.tsx`:
```tsx
'use client';

import { Button } from '@/shared/components/ui/button';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';

export default function DashboardPage() {
  const { data, isPending, isError, refetch } = useDashboard();

  if (isPending) {
    return <p className="p-8">Loading…</p>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p>Could not load the dashboard.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>Total items: {data.totalItems}</p>
      <p>Last updated: {data.lastUpdated}</p>
    </main>
  );
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/features/dashboard/hooks/use-dashboard.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/features/dashboard/api.ts templates/nextjs-react/src/features/dashboard/hooks/use-dashboard.ts templates/nextjs-react/src/app/dashboard/page.tsx templates/nextjs-react/src/features/dashboard/hooks/use-dashboard.test.tsx
git commit -m "feat: add protected dashboard page and useDashboard hook"
```

---

### Task 12: CI, Docker, and nginx

**Files:**
- Create: `templates/nextjs-react/.github/workflows/ci.yml`
- Create: `templates/nextjs-react/Dockerfile`
- Create: `templates/nextjs-react/docker-compose.yml`
- Create: `templates/nextjs-react/nginx.conf`
- Create: `templates/nextjs-react/.dockerignore`
- Test: `templates/nextjs-react/tests/deploy-config.test.mjs`

**Interfaces:**
- Consumes: `package.json`
- Produces: None

Steps:

1. Write the failing test:

```js
// templates/nextjs-react/tests/deploy-config.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('CI workflow runs lint, typecheck, test, and build', () => {
  const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.match(workflow, /pnpm lint/);
  assert.match(workflow, /pnpm typecheck/);
  assert.match(workflow, /pnpm test/);
  assert.match(workflow, /pnpm build/);
});

test('Dockerfile builds a standalone runner image', () => {
  const dockerfile = readFileSync(new URL('../Dockerfile', import.meta.url), 'utf8');
  assert.match(dockerfile, /AS deps/);
  assert.match(dockerfile, /AS builder/);
  assert.match(dockerfile, /AS runner/);
  assert.match(dockerfile, /\.next\/standalone/);
});

test('nginx.conf proxies to the app container', () => {
  const nginxConf = readFileSync(new URL('../nginx.conf', import.meta.url), 'utf8');
  assert.match(nginxConf, /proxy_pass http:\/\/app:3000/);
});
```

2. Run it, expect FAIL:

```
node --test templates/nextjs-react/tests/deploy-config.test.mjs
```
Expected error: `ENOENT: no such file or directory, open '...ci.yml'`

3. Write the minimal implementation.

`templates/nextjs-react/.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

`templates/nextjs-react/Dockerfile`:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

`templates/nextjs-react/docker-compose.yml`:
```yaml
services:
  app:
    build: .
    expose:
      - "3000"
    env_file:
      - .env
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
    restart: unless-stopped
```

`templates/nextjs-react/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;

    gzip on;
    gzip_types text/css application/javascript application/json;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

`templates/nextjs-react/.dockerignore`:
```
node_modules
.next
.git
*.log
```

4. Run the test, expect PASS:

```
node --test templates/nextjs-react/tests/deploy-config.test.mjs
```

5. Commit:

```
git add templates/nextjs-react/.github/workflows/ci.yml templates/nextjs-react/Dockerfile templates/nextjs-react/docker-compose.yml templates/nextjs-react/nginx.conf templates/nextjs-react/.dockerignore templates/nextjs-react/tests/deploy-config.test.mjs
git commit -m "ci: add GitHub Actions workflow, Dockerfile, and nginx reverse proxy"
```

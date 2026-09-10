# Dashboard Header Implementation Plan

> **For agentic workers:** execute this plan with the
> parallel-plan-executor Workflow (cys:run / the /cys:run-plan command).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a generic `Header` component to `templates/nextjs-react/`,
mounted via a new nested layout for the `/dashboard` area, replacing
the page's own duplicate title.

**Architecture:** `Header` is a presentational Server Component in
`shared/components/` (no hooks, no `'use client'`), configurable via
`title`/`actions` props. A new `src/app/dashboard/layout.tsx` composes
it above the page's `children`, so future pieces (Sidebar, Profile,
theme bar) attach to the layout without touching `dashboard/page.tsx`
again. `dashboard/page.tsx` loses its own `<h1>` since the Header now
owns that role.

**Tech Stack:** Next.js (App Router), TypeScript (`strict: true`),
Tailwind CSS, Vitest + React Testing Library (existing setup, no new
dependencies).

## Global Constraints

- All paths in this plan are relative to `templates/nextjs-react/`
  inside the monorepo. Every shell command is written to run from the
  monorepo root and references that prefix explicitly.
- Import shared/local modules via the `@/*` → `./src/*` alias.
- Never hardcode style values (colors, spacing) — only Tailwind utility
  classes backed by the CSS variables already in `src/styles/globals.css`.
- `shared/components/` stays generic: no business logic, no imports
  from `features/`.
- Every task that runs tests starts with `pnpm -C templates/nextjs-react
  install` in its own worktree (dependencies are gitignored).
- Test commands target exact file paths, never directories.
- Conventional Commit messages in English.

---

### Task 1: `shared/components/header.tsx` — generic Header

**Files:**
- Create: `templates/nextjs-react/src/shared/components/header.tsx`
- Test: `templates/nextjs-react/src/shared/components/header.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: `Header`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/shared/components/header.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Header } from './header';

describe('Header', () => {
  it('renders the title when passed', () => {
    render(<Header title="Dashboard" />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders the actions slot when passed', () => {
    render(<Header actions={<button>Log out</button>} />);

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('renders without crashing when no props are given', () => {
    render(<Header />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/header.test.tsx
```
Expected error: `Cannot find module './header'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/shared/components/header.tsx
import * as React from 'react';

export interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-input px-6 py-4">
      {title ? <h1 className="text-lg font-semibold">{title}</h1> : null}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/shared/components/header.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/shared/components/header.tsx templates/nextjs-react/src/shared/components/header.test.tsx
git commit -m "feat: add generic Header component"
```

---

### Task 2: `app/dashboard/layout.tsx` — mount Header above the dashboard

**Files:**
- Create: `templates/nextjs-react/src/app/dashboard/layout.tsx`
- Test: `templates/nextjs-react/src/app/dashboard/layout.test.tsx`

**Interfaces:**
- Consumes: `Header`
- Produces: `DashboardLayout`

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test:

```tsx
// templates/nextjs-react/src/app/dashboard/layout.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardLayout from './layout';

describe('DashboardLayout', () => {
  it('renders the Header with the Dashboard title and the page content', () => {
    render(
      <DashboardLayout>
        <p>page content</p>
      </DashboardLayout>
    );

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });
});
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/app/dashboard/layout.test.tsx
```
Expected error: `Cannot find module './layout'`

4. Write the minimal implementation:

```tsx
// templates/nextjs-react/src/app/dashboard/layout.tsx
import { Header } from '@/shared/components/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="Dashboard" />
      {children}
    </>
  );
}
```

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/app/dashboard/layout.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/app/dashboard/layout.tsx templates/nextjs-react/src/app/dashboard/layout.test.tsx
git commit -m "feat: mount Header via a nested dashboard layout"
```

---

### Task 3: Remove the duplicate title from `dashboard/page.tsx`

**Files:**
- Modify: `templates/nextjs-react/src/app/dashboard/page.tsx`
- Test: `templates/nextjs-react/src/app/dashboard/page.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: None

Note: independent of Tasks 1-2 at the file/interface level (this file
never imports `Header`/`DashboardLayout`) — safe to run in parallel.
The duplicate-title problem only exists once Task 2's layout is also
in place, but this task's own before/after test is self-contained.

Steps:

1. Install dependencies in this worktree:

```
pnpm -C templates/nextjs-react install
```

2. Write the failing test — add this case to the existing file:

```tsx
// templates/nextjs-react/src/app/dashboard/page.test.tsx
// (add inside the existing `describe('DashboardPage', ...)` block,
// alongside the two tests already there)
  it('does not render its own heading — the title now lives in the layout Header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ totalItems: 3, lastUpdated: '2026-09-07' }), {
            status: 200,
          })
      )
    );

    renderDashboardPage();

    await screen.findByText('Total items: 3');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
```

3. Run it, expect FAIL:

```
pnpm -C templates/nextjs-react exec vitest run src/app/dashboard/page.test.tsx
```
Expected error: the `<h1>Dashboard</h1>` heading is found, so
`expect(...).not.toBeInTheDocument()` fails.

4. Write the minimal implementation — remove the `<h1>` from the
success branch:

```tsx
// templates/nextjs-react/src/app/dashboard/page.tsx
  return (
    <main className="flex flex-col gap-4 p-8">
      <p>Total items: {data.totalItems}</p>
      <p>Last updated: {data.lastUpdated}</p>
    </main>
  );
```

(rest of the file — imports, `loading`/`error` branches — unchanged)

5. Run the test, expect PASS:

```
pnpm -C templates/nextjs-react exec vitest run src/app/dashboard/page.test.tsx
```

6. Commit:

```
git add templates/nextjs-react/src/app/dashboard/page.tsx templates/nextjs-react/src/app/dashboard/page.test.tsx
git commit -m "fix: remove dashboard page's duplicate title now owned by the Header"
```

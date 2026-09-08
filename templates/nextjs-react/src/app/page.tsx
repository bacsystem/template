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

import { Bell, UserCircle } from 'lucide-react';
import { Header } from '@/shared/components/header';
import { Button } from '@/shared/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header
        title="Dashboard"
        actions={
          <>
            <Button variant="ghost" size="sm" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" aria-label="Profile">
              <UserCircle className="h-4 w-4" />
            </Button>
          </>
        }
      />
      {children}
    </>
  );
}

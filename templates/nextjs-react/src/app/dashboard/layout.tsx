import { Header } from '@/shared/components/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header title="Dashboard" />
      {children}
    </>
  );
}

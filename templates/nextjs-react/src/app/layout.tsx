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

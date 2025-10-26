import './globals.css';

import type { ReactNode } from 'react';
import { defaultLocale } from '@/i18n/config';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-brand-charcoal antialiased">{children}</body>
    </html>
  );
}

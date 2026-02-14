/**
 * App Providers
 * 应用提供者组件 - 包裹所有客户端上下文提供者
 */

'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/auth-context';
import { TokenExpiredProvider } from '@/contexts/token-expired-context';
import type { Locale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';

interface ProvidersProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function Providers({ children, initialLocale = defaultLocale }: ProvidersProps) {
  return (
    <AuthProvider>
      <LanguageProvider initialLocale={initialLocale}>
        <TokenExpiredProvider>
          {children}
        </TokenExpiredProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

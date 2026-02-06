/**
 * Language Context
 * 语言上下文，用于客户端管理语言状态
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { defaultLocale, locales, localeNames, isValidLocale } from '@/i18n/config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLocale = defaultLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Load saved locale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved && isValidLocale(saved)) {
      setLocaleState(saved);
    }
  }, []);

  // Save locale to localStorage when changed
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        availableLocales: [defaultLocale, ...locales.filter((l) => l !== defaultLocale)] as readonly Locale[],
        localeNames,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

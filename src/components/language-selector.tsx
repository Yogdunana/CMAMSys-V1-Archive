/**
 * Language Selector Component
 * 语言选择器组件
 */

'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import type { Locale } from '@/i18n/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export function LanguageSelector({ className, showIcon = true }: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales, localeNames } = useLanguage();

  return (
    <div className={className}>
      <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        <SelectTrigger className="w-[140px]">
          {showIcon && <Globe className="mr-2 h-4 w-4" />}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLocales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {localeNames[loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

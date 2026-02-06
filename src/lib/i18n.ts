/**
 * i18n Utility Functions
 * 国际化工具函数
 */

import { useTranslations } from 'next-intl';

/**
 * Create a translation hook for a namespace
 * 创建命名空间的翻译钩子
 */
export function createTranslations(namespace: string) {
  return () => useTranslations(namespace);
}

/**
 * Common translations
 * 常用翻译
 */
export const useCommonTranslations = () => useTranslations('common');
export const useNavTranslations = () => useTranslations('nav');
export const useAppTranslations = () => useTranslations('app');
export const useStatusTranslations = () => useTranslations('status');
export const useValidationTranslations = () => useTranslations('validation');
export const useErrorTranslations = () => useTranslations('error');

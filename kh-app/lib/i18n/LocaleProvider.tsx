import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { translations } from './translations';
import { fonts } from '../theme/tokens';
import type { Lang } from '../types';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface LocaleContextValue {
  lang: Lang;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  /** localized field accessor: picks `field` or `fieldAr` from an object */
  tf: <T extends Record<string, any>>(obj: T, field: string) => string;
  /** font family for the active language + weight */
  f: (weight?: Weight) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const latinFont: Record<Weight, string> = {
  regular: fonts.regular,
  medium: fonts.medium,
  semibold: fonts.semibold,
  bold: fonts.bold,
  extrabold: fonts.extrabold,
};

const arabicFont: Record<Weight, string> = {
  regular: fonts.arRegular,
  medium: fonts.arRegular,
  semibold: fonts.arSemibold,
  bold: fonts.arBold,
  extrabold: fonts.arBold,
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const isRTL = lang === 'ar';

  const applyWebDir = useCallback((l: Lang) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = l;
    }
  }, []);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      applyWebDir(l);
    },
    [applyWebDir],
  );

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en');
  }, [lang, setLang]);

  const value = useMemo<LocaleContextValue>(() => {
    const t = (key: string) => translations[lang][key] ?? translations.en[key] ?? key;
    const tf = (obj: Record<string, any>, field: string) => {
      if (lang === 'ar') {
        const arKey = field + 'Ar';
        return obj[arKey] ?? obj[field] ?? '';
      }
      return obj[field] ?? '';
    };
    const f = (weight: Weight = 'regular') =>
      (lang === 'ar' ? arabicFont : latinFont)[weight];
    return { lang, isRTL, dir: isRTL ? 'rtl' : 'ltr', setLang, toggleLang, t, tf, f };
  }, [lang, isRTL, setLang, toggleLang]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import pt from './messages/pt-BR.json';
import en from './messages/en.json';

export type Locale = 'pt-BR' | 'en';

const catalogs: Record<Locale, typeof pt> = {
  'pt-BR': pt,
  en,
};

const getByPath = (obj: unknown, path: string): string => {
  const parts = path.split('.');
  let cur: any = obj;
  for (const part of parts) {
    if (cur == null) return path;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : path;
};

export const useTranslations = (namespace?: string) => {
  // Sempre pt-BR no SSR + 1º paint; localStorage só depois do mount.
  const [locale, setLocale] = useState<Locale>('pt-BR');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('locale') as Locale | null;
      if (raw === 'en' || raw === 'pt-BR') setLocale(raw);
    } catch {
      /* ignore */
    }
  }, []);

  const dict = catalogs[locale] || pt;

  const t = useCallback(
    (key: string) => {
      const full = namespace ? `${namespace}.${key}` : key;
      return getByPath(dict, full);
    },
    [dict, namespace],
  );

  const changeLocale = useCallback((next: Locale) => {
    setLocale(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', next);
    }
  }, []);

  return useMemo(() => ({ t, locale, changeLocale }), [t, locale, changeLocale]);
};

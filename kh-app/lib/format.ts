import type { Lang } from './types';

const locales: Record<Lang, string> = { en: 'en-US', ar: 'ar-EG' };

export function fmtMoney(value: number, lang: Lang, currency = 'USD') {
  try {
    return new Intl.NumberFormat(locales[lang], {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

export function fmtMoneyShort(value: number, lang: Lang) {
  // value in millions
  const n = new Intl.NumberFormat(locales[lang], { maximumFractionDigits: 2 }).format(value);
  return lang === 'ar' ? `${n} مليون $` : `$${n}M`;
}

export function fmtNumber(value: number, lang: Lang) {
  return new Intl.NumberFormat(locales[lang]).format(value);
}

export function fmtDate(iso: string, lang: Lang) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locales[lang], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso: string, lang: Lang) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(locales[lang], {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

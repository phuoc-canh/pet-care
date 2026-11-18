import { currentLanguage, currentLocale, i18n, type Language } from '@/i18n';

/**
 * Định dạng theo ngôn ngữ đang chọn (đọc tại thời điểm gọi → đổi ngôn ngữ là đổi ngay).
 * Formatter Intl được cache theo locale vì tạo mới khá tốn.
 */

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function numberFormat(key: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const id = `n|${currentLocale()}|${key}`;
  let f = cache.get(id);
  if (!(f instanceof Intl.NumberFormat)) {
    f = new Intl.NumberFormat(currentLocale(), options);
    cache.set(id, f);
  }
  return f;
}

function dateFormat(key: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const id = `d|${currentLocale()}|${key}`;
  let f = cache.get(id);
  if (!(f instanceof Intl.DateTimeFormat)) {
    f = new Intl.DateTimeFormat(currentLocale(), options);
    cache.set(id, f);
  }
  return f;
}

export function formatNumber(value: number): string {
  return numberFormat('num', { maximumFractionDigits: 2 }).format(value);
}

export function formatAge(ageYears: number): string {
  if (ageYears < 1) return i18n.t('common.ageMonths', { count: Math.max(1, Math.round(ageYears * 12)) });
  return i18n.t('common.ageYears', { count: formatNumber(ageYears) });
}

export function formatWeight(weightKg: number): string {
  return i18n.t('common.weight', { value: formatNumber(weightKg) });
}

/** Tiền luôn là VND, nhưng định dạng theo locale: vi "250.000 ₫", en/ko "₫250,000". */
export function formatVnd(amount: number): string {
  try {
    return numberFormat('vnd', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} ₫`;
  }
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Date → "YYYY-MM-DD" theo giờ địa phương (không dùng toISOString để tránh lệch múi giờ). */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

/** "Thứ 5" · "Thu" · "목" */
export function weekdayShort(date: Date): string {
  return dateFormat('wd', { weekday: 'short' }).format(date);
}

const LONG_DATE: Record<Language, Intl.DateTimeFormatOptions> = {
  vi: { weekday: 'long', day: '2-digit', month: '2-digit' }, // Thứ Năm, 19/11
  en: { weekday: 'short', month: 'short', day: 'numeric' }, // Thu, Nov 19
  ko: { month: 'long', day: 'numeric', weekday: 'short' }, // 11월 19일 (목)
};

export function formatDateLong(key: string): string {
  const lang = currentLanguage();
  return dateFormat(`long-${lang}`, LONG_DATE[lang]).format(fromDateKey(key));
}

/** "19/11" · "11/19" · "11. 19." */
export function formatDayMonth(key: string): string {
  return dateFormat('dm', { day: '2-digit', month: '2-digit' }).format(fromDateKey(key));
}

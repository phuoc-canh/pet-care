import { strings } from '@/constants/strings';

const numberFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatAge(ageYears: number): string {
  if (ageYears < 1) {
    const months = Math.max(1, Math.round(ageYears * 12));
    return `${months} ${strings.common.months}`;
  }
  return `${formatNumber(ageYears)} ${strings.common.years}`;
}

export function formatWeight(weightKg: number): string {
  return `${formatNumber(weightKg)} ${strings.common.kg}`;
}

/** 350000 → "350.000 ₫" (tự format để không phụ thuộc Intl currency trên Hermes). */
export function formatVnd(amount: number): string {
  const rounded = Math.round(amount);
  const withDots = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots} ₫`;
}

const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;
const WEEKDAYS_LONG = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'] as const;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Date → "YYYY-MM-DD" theo giờ địa phương (không dùng toISOString để tránh lệch múi giờ). */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function weekdayShort(date: Date): string {
  return WEEKDAYS_SHORT[date.getDay()];
}

/** "Thứ ba, 18/11" */
export function formatDateLong(key: string): string {
  const date = fromDateKey(key);
  return `${WEEKDAYS_LONG[date.getDay()]}, ${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

/** "18/11" */
export function formatDayMonth(key: string): string {
  const date = fromDateKey(key);
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

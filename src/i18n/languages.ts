export type Language = 'vi' | 'en' | 'ko';

export interface LanguageOption {
  code: Language;
  flag: string;
  /** Tên ngôn ngữ viết bằng chính ngôn ngữ đó — không dịch. */
  nativeName: string;
  /** Locale đầy đủ cho Intl (ngày giờ, số, tiền). */
  locale: string;
}

export const LANGUAGES: readonly LanguageOption[] = [
  { code: 'vi', flag: '🇻🇳', nativeName: 'Tiếng Việt', locale: 'vi-VN' },
  { code: 'en', flag: '🇺🇸', nativeName: 'English', locale: 'en-US' },
  { code: 'ko', flag: '🇰🇷', nativeName: '한국어', locale: 'ko-KR' },
];

export const DEFAULT_LANGUAGE: Language = 'vi';

export function isLanguage(value: unknown): value is Language {
  return value === 'vi' || value === 'en' || value === 'ko';
}

export function localeOf(language: Language): string {
  return LANGUAGES.find((l) => l.code === language)?.locale ?? 'vi-VN';
}

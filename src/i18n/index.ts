import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, isLanguage, type Language, localeOf } from './languages';
import en from './locales/en.json';
import ko from './locales/ko.json';
import vi from './locales/vi.json';

/** en/ko phải có đủ key như vi (nguồn chuẩn) — thiếu key là lỗi TypeScript. */
const resources = {
  vi: { translation: vi },
  en: { translation: en satisfies typeof vi },
  ko: { translation: ko satisfies typeof vi },
} as const;

/** Ngôn ngữ thiết bị nếu là vi/en/ko, không thì "vi". */
export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return isLanguage(code) ? code : DEFAULT_LANGUAGE;
}

/** Instance riêng (không dùng default export toàn cục) — dễ test và rõ nguồn gốc. */
const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ['vi', 'en', 'ko'],
  interpolation: { escapeValue: false }, // React Native tự escape
  returnNull: false,
  returnEmptyString: true, // "" là bản dịch hợp lệ (vd. ko howIsBefore), không fallback sang vi
  initAsync: false, // resources nằm sẵn trong bundle → init đồng bộ, không nháy key thô
});

export function currentLanguage(): Language {
  return isLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;
}

export function currentLocale(): string {
  return localeOf(currentLanguage());
}

export { i18n };
export * from './languages';

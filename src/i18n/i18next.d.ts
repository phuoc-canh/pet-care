import 'i18next';

import type vi from './locales/vi.json';

/** Key dịch có kiểu: gõ sai key (vd. t('pet.hoem.title')) là lỗi TypeScript. */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof vi };
    returnNull: false;
  }
}

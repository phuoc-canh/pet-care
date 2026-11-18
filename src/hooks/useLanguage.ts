import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { isLanguage, type Language } from '@/i18n';
import { useAppStore } from '@/store/app.store';

import { haptic } from './useHaptic';

/** Ngôn ngữ hiện tại + hàm đổi (lưu Zustand persist, đồng bộ i18next, haptic nhẹ). */
export function useLanguage() {
  const { i18n } = useTranslation(); // subscribe → re-render khi đổi ngôn ngữ
  const setStored = useAppStore((s) => s.setLanguage);
  const language: Language = isLanguage(i18n.language) ? i18n.language : 'vi';

  const setLanguage = useCallback(
    (next: Language) => {
      if (next === language) return;
      haptic.selection();
      setStored(next);
    },
    [language, setStored],
  );

  return { language, setLanguage };
}

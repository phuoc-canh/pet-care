import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { i18n, type Language } from '@/i18n';
import { queryClient } from '@/libs/queryClient';
import { STORAGE_KEYS } from '@/libs/storage';

/** CHỈ UI/global state. Dữ liệu server (pets, lịch hẹn) nằm trong TanStack Query. */
interface AppState {
  onboardingDone: boolean;
  selectedPetId: string | null;
  /** null = theo ngôn ngữ thiết bị */
  language: Language | null;
  completeOnboarding: () => void;
  setLanguage: (language: Language) => void;
  selectPet: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      selectedPetId: null,
      language: null,
      completeOnboarding: () => set({ onboardingDone: true }),
      setLanguage: (language) => {
        set({ language });
        void i18n.changeLanguage(language);
        // Như đổi Accept-Language: dữ liệu mock (vd. giống của thú cưng mẫu) được trả theo ngôn ngữ mới.
        void queryClient.invalidateQueries();
      },
      selectPet: (id) => set({ selectedPetId: id }),
    }),
    {
      name: STORAGE_KEYS.appStore,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ onboardingDone: s.onboardingDone, selectedPetId: s.selectedPetId, language: s.language }),
      // Đồng bộ i18next với ngôn ngữ đã lưu ngay khi đọc xong AsyncStorage (trước khi ẩn splash).
      onRehydrateStorage: () => (state) => {
        if (state?.language) void i18n.changeLanguage(state.language);
      },
    },
  ),
);

/** true khi store đã đọc xong AsyncStorage — tránh nháy onboarding với user cũ. */
const subscribeHydration = (cb: () => void) => useAppStore.persist.onFinishHydration(cb);
const getHydrated = () => useAppStore.persist.hasHydrated();

export function useAppStoreHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, getHydrated, getHydrated);
}

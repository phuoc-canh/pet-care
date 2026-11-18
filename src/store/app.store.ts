import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/libs/storage';

/** CHỈ UI/global state. Dữ liệu server (pets, lịch hẹn) nằm trong TanStack Query. */
interface AppState {
  onboardingDone: boolean;
  selectedPetId: string | null;
  completeOnboarding: () => void;
  selectPet: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      selectedPetId: null,
      completeOnboarding: () => set({ onboardingDone: true }),
      selectPet: (id) => set({ selectedPetId: id }),
    }),
    {
      name: STORAGE_KEYS.appStore,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ onboardingDone: s.onboardingDone, selectedPetId: s.selectedPetId }),
    },
  ),
);

/** true khi store đã đọc xong AsyncStorage — tránh nháy onboarding với user cũ. */
const subscribeHydration = (cb: () => void) => useAppStore.persist.onFinishHydration(cb);
const getHydrated = () => useAppStore.persist.hasHydrated();

export function useAppStoreHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, getHydrated, getHydrated);
}

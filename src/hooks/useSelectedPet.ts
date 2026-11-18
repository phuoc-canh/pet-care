import { useMemo } from 'react';

import { usePets } from '@/hooks/services/usePets';
import { useAppStore } from '@/store/app.store';

/**
 * Ghép server state (danh sách pet từ TanStack Query) với UI state (id đang chọn từ Zustand).
 * Nếu id đã chọn không còn (vd. vừa xóa) thì rơi về con đầu tiên.
 */
export function useSelectedPet() {
  const query = usePets();
  const selectedPetId = useAppStore((s) => s.selectedPetId);
  const selectPet = useAppStore((s) => s.selectPet);

  const pets = useMemo(() => query.data ?? [], [query.data]);
  const pet = useMemo(() => pets.find((p) => p.id === selectedPetId) ?? pets[0], [pets, selectedPetId]);

  return { query, pets, pet, selectPet };
}

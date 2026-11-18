import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/libs/storage';
import type { ChatMessage } from '@/types/services-type/chat.type';

const MAX_STORED_PER_PET = 60;
const EMPTY: ChatMessage[] = [];

/**
 * Lịch sử chat theo từng thú cưng (UI state phía client, persist AsyncStorage).
 * Text đang stream KHÔNG đi qua store này (tránh ghi AsyncStorage mỗi frame) —
 * chỉ commit 1 lần khi câu trả lời hoàn tất.
 */
interface ChatState {
  threads: Record<string, ChatMessage[]>;
  append: (petId: string, message: ChatMessage) => void;
  remove: (petId: string, messageId: string) => void;
  clear: (petId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      threads: {},
      append: (petId, message) =>
        set((s) => ({
          threads: { ...s.threads, [petId]: [...(s.threads[petId] ?? EMPTY), message].slice(-MAX_STORED_PER_PET) },
        })),
      remove: (petId, messageId) =>
        set((s) => ({
          threads: { ...s.threads, [petId]: (s.threads[petId] ?? EMPTY).filter((m) => m.id !== messageId) },
        })),
      clear: (petId) =>
        set((s) => {
          const next = { ...s.threads };
          delete next[petId];
          return { threads: next };
        }),
    }),
    {
      name: STORAGE_KEYS.chatStore,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ threads: s.threads }),
    },
  ),
);

/** Selector ổn định: trả cùng một mảng rỗng khi chưa có lịch sử (tránh re-render thừa). */
export function useChatThread(petId: string | undefined): ChatMessage[] {
  return useChatStore((s) => (petId ? (s.threads[petId] ?? EMPTY) : EMPTY));
}

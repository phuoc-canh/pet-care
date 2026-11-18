import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { suggestionsFor } from '@/data/ai-mock';
import { AppError } from '@/libs/http';
import { aiService } from '@/services/ai.service';
import { useChatStore, useChatThread } from '@/store/chat.store';
import type { ChatMessage } from '@/types/services-type/chat.type';
import type { AppErrorCode } from '@/types/services-type/common.type';
import type { Pet } from '@/types/services-type/pet.type';
import { createId, nowIso } from '@/utils/helpers';

import { haptic } from './useHaptic';

/**
 * Store text siêu nhỏ cho bubble đang stream. Chỉ component StreamingBubble subscribe
 * (useSyncExternalStore) → mỗi frame CHỈ bubble đó re-render, không phải cả màn chat/list.
 */
export interface TextStore {
  get: () => string;
  set: (value: string) => void;
  subscribe: (listener: () => void) => () => void;
}

function createTextStore(): TextStore {
  let value = '';
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (next === value) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Lấy n ký tự đầu nhưng không cắt đôi cặp surrogate (emoji). */
function takeChars(text: string, n: number): number {
  let end = Math.min(n, text.length);
  const code = text.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff && end < text.length) end += 1;
  return end;
}

/** Lịch sử gửi lên AI: bỏ câu trả lời offline (mock) và tin rỗng. */
function toHistory(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.content.trim().length > 0 && !(m.role === 'assistant' && m.offline))
    .map((m) => ({ role: m.role, content: m.content }));
}

export interface ChatStreamState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamStore: TextStore;
  /** Lý do lần trả lời gần nhất chạy offline (để hiện badge "Chế độ offline"). */
  offlineReason: AppErrorCode | null;
  /** Câu hỏi gợi ý theo hồ sơ thú cưng. */
  suggestions: string[];
  send: (text: string) => void;
  stop: () => void;
  retry: (assistantMessageId: string) => void;
  clear: () => void;
}

export function useChatStream(pet: Pet | undefined): ChatStreamState {
  const messages = useChatThread(pet?.id);
  const append = useChatStore((s) => s.append);
  const remove = useChatStore((s) => s.remove);
  const clearThread = useChatStore((s) => s.clear);

  const [streamStore] = useState(createTextStore);
  const [isStreaming, setIsStreaming] = useState(false);
  const [offlineReason, setOfflineReason] = useState<AppErrorCode | null>(null);

  // Trạng thái stream giữ trong ref: thay đổi mỗi token nhưng không cần render lại view.
  const abortRef = useRef<AbortController | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef(''); // đã nhận, chưa hiển thị
  const shownRef = useRef(''); // đã hiển thị
  const finishedRef = useRef(false);
  const drainResolveRef = useRef<(() => void) | null>(null);

  const stopFrameLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  /**
   * Vòng lặp theo requestAnimationFrame: mỗi frame lấy một phần buffer ra hiển thị.
   * Tốc độ thích ứng theo độ dài buffer → câu trả lời đến "một cục" (RevidAPI hay gom)
   * vẫn hiện ra như đang gõ, và setState tối đa 1 lần/frame thay vì mỗi token.
   */
  const startFrameLoop = useCallback(() => {
    const tick = () => {
      const pending = pendingRef.current;
      if (pending.length > 0) {
        const n = takeChars(pending, Math.max(2, Math.ceil(pending.length / 10)));
        shownRef.current += pending.slice(0, n);
        pendingRef.current = pending.slice(n);
        streamStore.set(shownRef.current);
      }
      if (finishedRef.current && pendingRef.current.length === 0) {
        rafRef.current = null;
        drainResolveRef.current?.();
        drainResolveRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    stopFrameLoop();
    rafRef.current = requestAnimationFrame(tick);
  }, [stopFrameLoop, streamStore]);

  const resetStream = useCallback(() => {
    pendingRef.current = '';
    shownRef.current = '';
    finishedRef.current = false;
    streamStore.set('');
  }, [streamStore]);

  const run = useCallback(
    async (target: Pet, history: ChatMessage[]) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      resetStream();
      setIsStreaming(true);
      startFrameLoop();

      const commit = (patch: Partial<ChatMessage> = {}) => {
        const content = shownRef.current.trim();
        if (content || patch.errorCode) {
          append(target.id, {
            id: createId('msg_'),
            role: 'assistant',
            content,
            createdAt: nowIso(),
            status: patch.errorCode && !content ? 'error' : 'done',
            ...patch,
          });
        }
      };

      try {
        const result = await aiService.sendMessage({
          pet: target,
          history: toHistory(history),
          signal: controller.signal,
          onToken: (delta) => {
            pendingRef.current += delta;
          },
        });
        // Chờ bộ đệm hiển thị hết rồi mới commit vào store (chuyển tiếp liền mạch).
        await new Promise<void>((resolve) => {
          drainResolveRef.current = resolve;
          finishedRef.current = true;
        });
        if (abortRef.current !== controller) return;
        commit({ offline: result.source === 'offline', errorCode: result.reason });
        setOfflineReason(result.source === 'offline' ? (result.reason ?? 'UNKNOWN') : null);
        haptic.light();
      } catch (err) {
        // Người dùng bấm Dừng / rời màn hình: giữ phần đã hiện, bỏ phần chưa hiện.
        if (!(err instanceof AppError && err.code === 'ABORTED')) commit({ errorCode: 'UNKNOWN' });
      } finally {
        if (abortRef.current === controller) {
          stopFrameLoop();
          abortRef.current = null;
          resetStream();
          setIsStreaming(false);
        }
      }
    },
    [append, resetStream, startFrameLoop, stopFrameLoop],
  );

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!pet || !content || abortRef.current) return;
      const userMessage: ChatMessage = {
        id: createId('msg_'),
        role: 'user',
        content: content.slice(0, 1000),
        createdAt: nowIso(),
        status: 'done',
      };
      append(pet.id, userMessage);
      haptic.light();
      void run(pet, [...messages, userMessage]);
    },
    [append, messages, pet, run],
  );

  const stop = useCallback(() => {
    const controller = abortRef.current;
    if (!controller) return;
    // Commit phần đã hiển thị trước khi abort để người dùng không mất nội dung.
    const partial = shownRef.current.trim();
    if (partial && pet) {
      append(pet.id, { id: createId('msg_'), role: 'assistant', content: partial, createdAt: nowIso(), status: 'done' });
    }
    abortRef.current = null;
    controller.abort();
    stopFrameLoop();
    drainResolveRef.current = null;
    resetStream();
    setIsStreaming(false);
  }, [append, pet, resetStream, stopFrameLoop]);

  const retry = useCallback(
    (assistantMessageId: string) => {
      if (!pet || abortRef.current) return;
      const index = messages.findIndex((m) => m.id === assistantMessageId);
      if (index < 0) return;
      const history = messages.slice(0, index);
      if (history[history.length - 1]?.role !== 'user') return;
      remove(pet.id, assistantMessageId);
      void run(pet, history);
    },
    [messages, pet, remove, run],
  );

  const clear = useCallback(() => {
    if (!pet) return;
    stop();
    clearThread(pet.id);
    setOfflineReason(null);
  }, [clearThread, pet, stop]);

  // Đổi thú cưng / rời màn hình → dừng stream của con cũ (giữ phần đã hiện vào đúng thread cũ).
  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);
  const petId = pet?.id;
  useEffect(() => () => stopRef.current(), [petId]);

  // Unmount → dọn rAF.
  useEffect(() => stopFrameLoop, [stopFrameLoop]);

  const suggestions = useMemo(() => (pet ? suggestionsFor(pet) : []), [pet]);

  return { messages, isStreaming, streamStore, offlineReason, suggestions, send, stop, retry, clear };
}

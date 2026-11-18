import { fetch as expoFetch } from 'expo/fetch';

import { mockAnswer } from '@/data/ai-mock';
import { AppError, buildHeaders, createTimeoutController, env, errorFromResponse, hasAiConfig, toAppError } from '@/libs/http';
import { createSseParser } from '@/libs/sse';
import type { ChatRequestBody, SendMessageParams, SendMessageResult } from '@/types/services-type/chat.type';
import { sleep } from '@/utils/helpers';

/**
 * Tối đa 30s chờ token đầu tiên: worker có thể tự chuyển qua 2–3 model dự phòng
 * (mỗi model ≤14s, tổng ≤26s) — app phải chờ lâu hơn ngân sách đó, không thì bỏ cuộc
 * sang offline trước khi model dự phòng kịp trả lời.
 */
const FIRST_TOKEN_TIMEOUT_MS = 30_000;
/** Sau khi đã có dữ liệu: stream im lặng quá 20s thì coi như treo. */
const IDLE_TIMEOUT_MS = 20_000;
/** Worker nhận tối đa 20 tin, mỗi tin ≤ 1000 ký tự. */
const MAX_HISTORY = 20;
const MAX_CHARS = 1000;

function buildBody({ pet, history, language }: Pick<SendMessageParams, 'pet' | 'history' | 'language'>): ChatRequestBody {
  return {
    lang: language,
    pet: {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      ageYears: pet.ageYears,
      weightKg: pet.weightKg,
      personalities: pet.personalities,
    },
    messages: history.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) })),
  };
}

/**
 * Đọc stream bằng `expo/fetch` (native streaming, chạy trên Expo Go SDK 52+).
 * Nếu môi trường không trả `response.body` → đọc toàn bộ text rồi parse một lần
 * (UI vẫn "gõ chữ" mượt nhờ bộ đệm theo frame ở useChatStream).
 */
async function streamFromWorker({ pet, history, language, signal, onToken }: SendMessageParams): Promise<void> {
  const tc = createTimeoutController(FIRST_TOKEN_TIMEOUT_MS, signal);
  let received = false;
  const parser = createSseParser({
    onEvent: () => tc.reset(IDLE_TIMEOUT_MS),
    onContent: (delta) => {
      received = true;
      onToken(delta);
    },
  });

  try {
    const res = await expoFetch(env.aiUrl, {
      method: 'POST',
      headers: buildHeaders({ Accept: 'text/event-stream' }),
      body: JSON.stringify(buildBody({ pet, history, language })),
      signal: tc.signal,
    });
    if (!res.ok) throw await errorFromResponse(res);

    const reader = res.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (parser.push(decoder.decode(value, { stream: true }))) {
          await reader.cancel().catch(() => undefined);
          break;
        }
      }
      parser.push(decoder.decode());
    } else {
      parser.push(await res.text());
    }
    parser.flush();

    if (!received) throw new AppError('SERVER');
  } catch (err) {
    if (signal?.aborted) throw new AppError('ABORTED');
    if (tc.didTimeout()) throw new AppError('TIMEOUT');
    throw toAppError(err);
  } finally {
    tc.clear();
  }
}

/** Phát câu trả lời mock theo từng cụm nhỏ để trải nghiệm giống AI thật. */
async function streamOffline({ pet, history, language, signal, onToken }: SendMessageParams): Promise<void> {
  const question = [...history].reverse().find((m) => m.role === 'user')?.content ?? '';
  const answer = mockAnswer(pet, question, language);
  await sleep(450);
  const parts = answer.match(/\S+\s*/g) ?? [answer];
  for (let i = 0; i < parts.length; i += 3) {
    if (signal?.aborted) throw new AppError('ABORTED');
    onToken(parts.slice(i, i + 3).join(''));
    await sleep(16);
  }
}

/**
 * Gửi tin nhắn tới AI qua worker. KHÔNG BAO GIỜ ném lỗi ra UI (trừ khi người dùng tự hủy):
 * lỗi mạng / timeout / 4xx / 5xx / thiếu env → tự chuyển sang câu trả lời offline.
 */
async function sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
  if (!hasAiConfig) {
    await streamOffline(params);
    return { source: 'offline', reason: 'MISSING_CONFIG' };
  }

  let emitted = false;
  const wrapped: SendMessageParams = {
    ...params,
    onToken: (delta) => {
      emitted = true;
      params.onToken(delta);
    },
  };

  try {
    await streamFromWorker(wrapped);
    return { source: 'ai' };
  } catch (err) {
    const error = toAppError(err);
    if (error.code === 'ABORTED') throw error;
    // Đã nhận một phần câu trả lời rồi mới đứt → giữ phần đã có, báo lỗi để người dùng thử lại.
    if (emitted) return { source: 'ai', reason: error.code };
    await streamOffline(params);
    return { source: 'offline', reason: error.code };
  }
}

export const aiService = { sendMessage };

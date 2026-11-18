import type { Language } from '@/i18n/languages';

import type { AppErrorCode } from './common.type';
import type { Pet } from './pet.type';

export type ChatRole = 'user' | 'assistant';

export type ChatMessageStatus = 'done' | 'streaming' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  status: ChatMessageStatus;
  /** Câu trả lời sinh từ bộ mock offline (không phải AI thật). */
  offline?: boolean;
  /** Lỗi gắn với tin (hiện nút "Thử lại"). */
  errorCode?: AppErrorCode;
}

/** Hồ sơ gửi lên worker — chỉ field cần cho prompt, không gửi id/timestamps. */
export type PetProfilePayload = Pick<Pet, 'name' | 'species' | 'breed' | 'ageYears' | 'weightKg' | 'personalities'>;

export interface ChatRequestBody {
  /** Ngôn ngữ giao diện — AI dùng làm mặc định, nhưng ưu tiên ngôn ngữ người dùng đang gõ. */
  lang: Language;
  pet: PetProfilePayload;
  messages: { role: ChatRole; content: string }[];
}

export interface SendMessageParams {
  pet: Pet;
  language: Language;
  /** Lịch sử đã gồm tin user mới nhất ở cuối. */
  history: Pick<ChatMessage, 'role' | 'content'>[];
  signal?: AbortSignal;
  onToken: (delta: string) => void;
}

export interface SendMessageResult {
  source: 'ai' | 'offline';
  /** Lý do chuyển sang offline (để hiện thông báo thân thiện). */
  reason?: AppErrorCode;
}

import { strings } from '@/constants/strings';
import type { ApiErrorBody, AppErrorCode } from '@/types/services-type/common.type';
import { isRecord } from '@/utils/helpers';

/**
 * Fetch client dùng chung — vai trò như axios instance + interceptor bên web:
 * - base URL / header lấy từ env
 * - timeout bằng AbortController
 * - chuẩn hóa MỌI lỗi (mạng, timeout, HTTP status) thành AppError có `code`
 */

export const env = {
  aiUrl: process.env.EXPO_PUBLIC_AI_URL ?? '',
  appToken: process.env.EXPO_PUBLIC_APP_TOKEN ?? '',
} as const;

export const hasAiConfig = env.aiUrl.length > 0 && env.appToken.length > 0;

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status?: number;

  constructor(code: AppErrorCode, message?: string, status?: number) {
    super(message ?? messageForCode(code));
    this.name = 'AppError';
    this.code = code;
    this.status = status;
  }
}

export function messageForCode(code: AppErrorCode): string {
  const e = strings.error;
  switch (code) {
    case 'NETWORK':
      return e.network;
    case 'TIMEOUT':
      return e.timeout;
    case 'UNAUTHORIZED':
      return e.unauthorized;
    case 'NO_CREDIT':
      return e.noCredit;
    case 'RATE_LIMITED':
      return e.rateLimited;
    case 'NOT_FOUND':
      return e.notFound;
    case 'BAD_REQUEST':
      return e.badRequest;
    case 'SERVER':
      return e.server;
    case 'MISSING_CONFIG':
      return e.missingConfig;
    case 'ABORTED':
    case 'UNKNOWN':
      return e.generic;
  }
}

export function codeFromStatus(status: number): AppErrorCode {
  if (status === 400 || status === 413 || status === 422) return 'BAD_REQUEST';
  if (status === 401 || status === 403) return 'UNAUTHORIZED';
  if (status === 402) return 'NO_CREDIT';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER';
  return 'UNKNOWN';
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return isRecord(value) && typeof value.error === 'string';
}

/** Đọc body lỗi `{ error, code }` từ worker (nếu có) rồi map sang AppError. */
export async function errorFromResponse(res: { status: number; text: () => Promise<string> }): Promise<AppError> {
  const code = codeFromStatus(res.status);
  try {
    const parsed: unknown = JSON.parse(await res.text());
    if (isApiErrorBody(parsed)) return new AppError(code, messageForCode(code), res.status);
  } catch {
    // body không phải JSON — bỏ qua
  }
  return new AppError(code, undefined, res.status);
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) {
    if (err.name === 'AbortError') return new AppError('ABORTED');
    if (/network|failed to fetch|network request failed/i.test(err.message)) return new AppError('NETWORK');
  }
  return new AppError('UNKNOWN');
}

export interface TimeoutController {
  signal: AbortSignal;
  /** true nếu bị hủy do timeout (phân biệt với user bấm Dừng). */
  didTimeout: () => boolean;
  /** Gia hạn/khởi động lại bộ đếm (vd. sau khi nhận token đầu). */
  reset: (ms: number) => void;
  clear: () => void;
}

/**
 * AbortController gộp: hủy khi hết giờ HOẶC khi signal bên ngoài (màn hình rời đi / nút Dừng) abort.
 * Không dùng AbortSignal.any/timeout vì Hermes chưa hỗ trợ đầy đủ.
 */
export function createTimeoutController(ms: number, external?: AbortSignal): TimeoutController {
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const start = (duration: number) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, duration);
  };
  start(ms);

  const onExternalAbort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener('abort', onExternalAbort);
  }

  return {
    signal: controller.signal,
    didTimeout: () => timedOut,
    reset: start,
    clear: () => {
      if (timer) clearTimeout(timer);
      external?.removeEventListener('abort', onExternalAbort);
    },
  };
}

export function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(env.appToken ? { 'x-app-token': env.appToken } : {}),
    ...extra,
  };
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

/** JSON request chuẩn. Ném AppError khi lỗi. */
export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, timeoutMs = 15000, signal } = options;
  const tc = createTimeoutController(timeoutMs, signal);
  try {
    const res = await fetch(url, {
      method,
      headers: buildHeaders(headers),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: tc.signal,
    });
    if (!res.ok) throw await errorFromResponse(res);
    return (await res.json()) as T;
  } catch (err) {
    if (tc.didTimeout()) throw new AppError('TIMEOUT');
    throw toAppError(err);
  } finally {
    tc.clear();
  }
}

export const http = { request, env, hasAiConfig, buildHeaders, createTimeoutController, errorFromResponse, toAppError };

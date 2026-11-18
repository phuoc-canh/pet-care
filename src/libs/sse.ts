/**
 * Parser SSE định dạng OpenAI Chat Completions (incremental).
 *
 *   data: {"choices":[{"delta":{"content":"Xin"}}]}
 *   data: {"choices":[{"delta":{"content":" chào"}}]}
 *   data: [DONE]
 *
 * Nhận từng mảnh text bất kỳ (có thể cắt ngang giữa dòng / giữa JSON),
 * tự gom buffer, chỉ phát ra phần `choices[0].delta.content`, bỏ chunk rỗng
 * (vd. chunk chỉ có role, reasoning_content, usage).
 */

export interface SseParser {
  /** Đưa thêm text vào. Trả về true nếu đã gặp [DONE]. */
  push: (text: string) => boolean;
  /** Xử lý phần còn sót trong buffer khi stream đóng mà không có newline cuối. */
  flush: () => boolean;
  readonly done: boolean;
}

export interface SseHandlers {
  onContent: (delta: string) => void;
  /** Bất kỳ sự kiện nào (kể cả reasoning/keep-alive) — dùng để biết stream còn sống. */
  onEvent?: () => void;
}

function extractContent(payload: string): string | null {
  try {
    const data: unknown = JSON.parse(payload);
    if (typeof data !== 'object' || data === null || !('choices' in data)) return null;
    const choices = (data as { choices: unknown }).choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const first: unknown = choices[0];
    if (typeof first !== 'object' || first === null) return null;
    const delta = (first as { delta?: unknown }).delta;
    if (typeof delta === 'object' && delta !== null) {
      const content = (delta as { content?: unknown }).content;
      if (typeof content === 'string' && content.length > 0) return content;
    }
    // Một số provider trả non-stream object trong SSE: choices[0].message.content
    const message = (first as { message?: unknown }).message;
    if (typeof message === 'object' && message !== null) {
      const content = (message as { content?: unknown }).content;
      if (typeof content === 'string' && content.length > 0) return content;
    }
    return null;
  } catch {
    return null; // JSON hỏng → bỏ qua dòng đó, không làm sập stream
  }
}

export function createSseParser({ onContent, onEvent }: SseHandlers): SseParser {
  let buffer = '';
  let done = false;

  const handleLine = (rawLine: string) => {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    if (!line.startsWith('data:')) return; // bỏ comment ":", "event:", "id:", dòng trống
    const payload = line.slice(5).trim();
    if (!payload) return;
    onEvent?.();
    if (payload === '[DONE]') {
      done = true;
      return;
    }
    const content = extractContent(payload);
    if (content) onContent(content);
  };

  return {
    push(text: string) {
      if (done) return true;
      buffer += text;
      let newline = buffer.indexOf('\n');
      while (newline >= 0 && !done) {
        handleLine(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf('\n');
      }
      return done;
    },
    flush() {
      if (!done && buffer.length > 0) handleLine(buffer);
      buffer = '';
      return done;
    },
    get done() {
      return done;
    },
  };
}

export type AppErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'UNAUTHORIZED'
  | 'NO_CREDIT'
  | 'RATE_LIMITED'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'SERVER'
  | 'MISSING_CONFIG'
  | 'UNKNOWN';

export interface ApiErrorBody {
  error: string;
  code?: string;
}

export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** Payload tạo mới: bỏ các field do server sinh. */
export type CreateInput<T extends Entity> = Omit<T, keyof Entity>;
export type UpdateInput<T extends Entity> = Partial<CreateInput<T>>;

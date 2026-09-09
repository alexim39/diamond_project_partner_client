import { HttpErrorResponse } from '@angular/common/http';

/**
 * Normalized client-side error. Interceptor maps the backend envelope
 * `{ message, success:false, code }` (and legacy variants) into this shape
 * so components never parse `error.error.message` chains themselves.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    const body = (error.error ?? {}) as { message?: unknown; code?: unknown };
    return {
      status: error.status,
      code: typeof body.code === 'string' ? body.code : 'HTTP_ERROR',
      message:
        typeof body.message === 'string' && body.message.length > 0
          ? body.message
          : error.status === 0
            ? 'Cannot reach the server. Check your connection.'
            : 'Server error occurred, please try again.',
    };
  }
  return { status: 0, code: 'UNKNOWN', message: 'Unexpected error occurred.' };
}

import { HttpErrorResponse } from '@angular/common/http';

/**
 * Normalized client-side error. Interceptor maps the backend envelope
 * `{ message, success:false, code }` (and legacy variants) into this shape
 * so components never parse `error.error.message` chains themselves.
 * `details` carries additive server context (e.g. Zod field issues) and is
 * absent for legacy callers — always optional, never required.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    const body = (error.error ?? {}) as { message?: unknown; code?: unknown; details?: unknown };
    return {
      status: error.status,
      code: typeof body.code === 'string' ? body.code : 'HTTP_ERROR',
      message:
        typeof body.message === 'string' && body.message.length > 0
          ? body.message
          : error.status === 0
            ? 'Cannot reach the server. Check your connection.'
            : 'Server error occurred, please try again.',
      ...(body.details !== undefined ? { details: body.details } : {}),
    };
  }
  return { status: 0, code: 'UNKNOWN', message: 'Unexpected error occurred.' };
}

/** First Zod field issue as `path: message`, for validation failures. */
export function validationDetail(error: ApiError): string | null {
  const issues = (error as { details?: { issues?: Array<{ path?: unknown; message?: unknown }> } })
    ?.details?.issues;
  if (!Array.isArray(issues) || issues.length === 0) return null;
  const first = issues[0];
  const path = Array.isArray(first.path) ? first.path.map(String).join('.') : '';
  const msg = typeof first.message === 'string' ? first.message : '';
  if (!path && !msg) return null;
  return path ? `${path}: ${msg}` : msg;
}

/**
 * User-facing error text: backend message plus the exact rejected field,
 * so a 400 names its cause ("Invalid request data — body: Message must
 * be 1–960 characters") instead of leaving the user guessing.
 * Tolerant of both shapes in the codebase: normalized `ApiError` (from
 * the interceptor) and raw `HttpErrorResponse` (legacy handlers).
 */
export function userError(error: unknown): string {
  const api = error instanceof HttpErrorResponse
    ? toApiError(error)
    : ((error ?? {}) as ApiError & { error?: { message?: unknown } });
  // Legacy handlers pass the raw response envelope (`{ error: { message } }`).
  const nested = (api as { error?: { message?: unknown } }).error;
  const rawMessage = typeof api.message === 'string' && api.message.length > 0
    ? api.message
    : (typeof nested?.message === 'string' ? nested.message : '');
  const message = rawMessage || 'Server error occurred, please try again.';
  const detail = validationDetail({ ...api, message });
  return detail ? `${message} — ${detail}` : message;
}

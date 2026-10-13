/**
 * Contracts for the backend `identity-access` slice (`/v1/auth/*`).
 * `AuthUser` mirrors `toSafePartner` — it NEVER contains password or tokens.
 */

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  reservationCode: string;
  tnc?: boolean;
}

/** Canonical roles (backend normalizes legacy 'User'/'admin' casing; `g8` is admin-bestowed). */
export type UserRole = 'user' | 'leader' | 'g8' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role?: UserRole | string;
  [key: string]: unknown;
}

/** Backend envelope: `{ message, success, data?, ticket?/userObject? }`. */
export interface ApiEnvelope<T = unknown> {
  message: string;
  success: boolean;
  data?: T;
  code?: string;
}

export interface SigninResponse extends ApiEnvelope<{ user: AuthUser; token?: string }> {
  message: string;
  success: boolean;
}

export interface MeResponse extends ApiEnvelope<AuthUser> {
  data: AuthUser;
}

/** Self-service erasure scheduling (`POST /v1/auth/me/erasure`). */
export interface ErasureSchedule {
  requestedAt: string;
  scheduledFor: string;
  email: string | null;
  name: string;
}

export interface ErasureScheduleResponse extends ApiEnvelope<ErasureSchedule> {
  data: ErasureSchedule;
}

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

/** Canonical roles (backend normalizes legacy 'User'/'admin' casing). */
export type UserRole = 'user' | 'leader' | 'admin';

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

export interface SigninResponse extends ApiEnvelope<{ user: AuthUser }> {
  message: string;
  success: boolean;
}

export interface MeResponse extends ApiEnvelope<AuthUser> {
  data: AuthUser;
}

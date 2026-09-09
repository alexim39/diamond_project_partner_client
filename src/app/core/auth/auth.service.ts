import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ApiClient } from '../http/api-client.service';
import { AuthUser, MeResponse, SigninRequest, SigninResponse, SignupRequest } from './auth.models';

/**
 * Session authority for the app. The JWT lives in an httpOnly cookie
 * managed by the backend — this service NEVER touches `localStorage`
 * (legacy stored `"[object Object]"` there and the old guard trusted it).
 *
 * State: `currentUser` signal (null = unknown/anonymous). `me()` hydrates
 * it server-side; the guard calls `resolve()` which uses the cache when warm.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiClient);

  private readonly userSignal = signal<AuthUser | null>(null);
  private hydrated = false;

  /** Last-known user; null until `me()` succeeds. */
  readonly currentUser = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  signin(credentials: SigninRequest): Observable<SigninResponse> {
    return this.api.post<SigninResponse>('v1/auth/signin', credentials).pipe(
      tap((res) => {
        this.userSignal.set(res.data?.user ?? null);
        this.hydrated = true;
      }),
    );
  }

  signup(payload: SignupRequest): Observable<unknown> {
    return this.api.post('v1/auth/signup', payload);
  }

  signOut(): Observable<unknown> {
    return this.api.post('v1/auth/signout', {}).pipe(
      tap(() => {
        this.userSignal.set(null);
        this.hydrated = false;
      }),
    );
  }

  /** Server-verified session check (cookie → `GET /v1/auth/me`). */
  me(): Observable<MeResponse> {
    return this.api.get<MeResponse>('v1/auth/me').pipe(
      tap((res) => {
        this.userSignal.set(res.data);
        this.hydrated = true;
      }),
    );
  }

  /**
   * Guard entry: cached user → instant true; otherwise one `me()` call.
   * Resolves false (caller redirects) instead of throwing.
   */
  resolve(): Observable<boolean> {
    if (this.hydrated && this.userSignal() !== null) return of(true);
    return this.me().pipe(
      map(() => true),
      catchError(() => {
        this.userSignal.set(null);
        this.hydrated = false;
        return of(false);
      }),
    );
  }
}

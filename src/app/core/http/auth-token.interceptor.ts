import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../config/api-tokens';
import { AuthService } from '../auth/auth.service';

/**
 * Bearer fallback for the backend JWT session. Runs beside
 * `credentialsInterceptor` (cookie stays primary): when the browser
 * dropped the cross-site `jwt` cookie, replay the token the signin
 * response carried in its body. Scoped to API-host requests only —
 * never leaks onto third-party calls.
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('Authorization')) return next(req);
  let base = '';
  let token: string | null = null;
  try {
    base = inject(API_BASE_URL);
    token = inject(AuthService).token();
  } catch {
    return next(req);
  }
  if (!token || !req.url.startsWith(base)) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

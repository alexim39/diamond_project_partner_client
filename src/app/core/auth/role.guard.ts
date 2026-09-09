import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { UserRole } from './auth.models';

/**
 * Role gate factory. Resolves the session first (cached user or one
 * `GET /v1/auth/me`), then checks the canonical role signal.
 * Denied-but-authenticated users land on `/dashboard`, anonymous on `/`.
 */
export function requireRoleGuard(...roles: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.resolve().pipe(
      switchMap((ok) => {
        if (!ok) return of(router.createUrlTree(['/']));
        return of(roles.includes(auth.role()) ? true : router.createUrlTree(['/dashboard']));
      }),
    );
  };
}

/** Shorthand for the admin console. */
export const adminGuard: CanActivateFn = requireRoleGuard('admin');

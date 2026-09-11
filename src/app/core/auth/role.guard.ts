import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { ProgressionService } from '../progression/progression.service';
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

/**
 * Ladder-aware gate for G8 oversight. Admins pass on role; everyone else
 * must hold ladder level `g8` (G8 is a journey level, not a user role).
 * Fails closed to `/dashboard`.
 */
export const g8Guard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const progress = inject(ProgressionService);
  const router = inject(Router);
  return auth.resolve().pipe(
    switchMap((ok) => {
      if (!ok) return of(router.createUrlTree(['/']));
      if (auth.isAdmin()) return of(true);
      return progress.mine().pipe(
        map((res) => (res.data?.level === 'g8' ? true : router.createUrlTree(['/dashboard']))),
        catchError(() => of(router.createUrlTree(['/dashboard']))),
      );
    }),
  );
};

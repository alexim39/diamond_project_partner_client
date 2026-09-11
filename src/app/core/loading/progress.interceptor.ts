import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { TopProgressService } from './top-progress.service';

/**
 * Drives the top progress bar for foreground requests. Background work
 * (polling, prefetch) opts out with the `X-Silent-Loading` header, which
 * is stripped here so it never reaches the server.
 */
export const SILENT_LOADING_HEADER = 'X-Silent-Loading';

export const progressInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has(SILENT_LOADING_HEADER)) {
    return next(req.clone({ headers: req.headers.delete(SILENT_LOADING_HEADER) }));
  }
  const progress = inject(TopProgressService);
  progress.show();
  return next(req).pipe(finalize(() => progress.hide()));
};

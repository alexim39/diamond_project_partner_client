import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { loadingInterceptor } from './_common/services/loader/spinner-interceptor.service';
import { credentialsInterceptor } from './core/http/credentials.interceptor';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(),
    // Single HttpClient: cookie transport + spinner + normalized errors.
    provideHttpClient(withXhr(), withInterceptors([credentialsInterceptor, loadingInterceptor, apiErrorInterceptor])),
  ]
};

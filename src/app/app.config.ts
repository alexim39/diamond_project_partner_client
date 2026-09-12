import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { progressInterceptor } from './core/loading/progress.interceptor';
import { credentialsInterceptor } from './core/http/credentials.interceptor';
import { apiErrorInterceptor } from './core/http/api-error.interceptor';
import { provideEchartsCore } from 'ngx-echarts';
import { echarts } from './core/charts/echarts-setup';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideAnimationsAsync(),
    // Single DateAdapter for every date/time picker (pages no longer each provide their own).
    provideNativeDateAdapter(),
    // Single HttpClient: cookie transport + top progress + normalized errors.
    provideHttpClient(withXhr(), withInterceptors([credentialsInterceptor, progressInterceptor, apiErrorInterceptor])),
    // ECharts core once (treeshaken); chart components use NgxEchartsDirective.
    provideEchartsCore({ echarts }),
  ]
};

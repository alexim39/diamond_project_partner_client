import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

// Offline shell + push share one worker (push-sw.js). Registering at boot
// (idempotent — the push flow reuses the same registration) so the app
// shell is cached and installable even before push is ever enabled.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/push-sw.js').catch(() => null);
  });
}

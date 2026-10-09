import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { OutboxService } from './outbox.service';

/**
 * @title Offline banner — connectivity + pending-sync status.
 * Sits at the top of every page; silent when online with an empty outbox.
 */
@Component({
  selector: 'async-offline-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (!outbox.online()) {
      <p class="offline-bar" role="status">
        <mat-icon aria-hidden="true">cloud_off</mat-icon>
        You're offline — reads still work, changes will sync.
      </p>
    } @else if (outbox.queued().length > 0 && !outbox.syncing()) {
      <p class="offline-bar queued" role="status">
        <mat-icon aria-hidden="true">sync</mat-icon>
        {{ outbox.queued().length }} change{{ outbox.queued().length === 1 ? '' : 's' }} waiting to sync.
      </p>
    } @else if (outbox.notice(); as note) {
      <p class="offline-bar synced" role="status">{{ note }}</p>
    }
  `,
  styles: [`
    .offline-bar {
      display: flex;
      align-items: center;
      gap: 0.5em;
      margin: 0;
      padding: 0.55em 1em;
      font-size: 0.85em;
      font-weight: 600;
      background: var(--dp-warning-bg);
      color: var(--dp-warning);
    }
    .offline-bar.queued { background: var(--dp-info-bg); color: var(--dp-info); }
    .offline-bar.synced { background: var(--dp-success-bg); color: var(--dp-success); }
    .offline-bar mat-icon { font-size: 18px; height: 18px; width: 18px; flex: none; }
  `],
})
export class OfflineBannerComponent {
  protected readonly outbox = inject(OutboxService);
}

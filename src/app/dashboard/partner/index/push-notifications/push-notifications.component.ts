import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { PartnerInterface } from '../../../../_common/services/partner.service';
import { PushNotificationInterface, PushNotificationService } from './push-notifications.service';
import { Router } from '@angular/router';

@Component({
  selector: 'async-push-notifications',
  template: `
    @if (notifications.length > 0) {
    
      <section class="notification-list">
        <div class="notification-list__header">
          <h2 class="notification-list__title">Follow-ups Notifications</h2>
          <div (click)="listAllNotifications()">View all notifications</div>
        </div>
    
        <mat-divider class="notification-list__divider" />
    
        @for (notif of notifications; track notif) {
          <button mat-menu-item
            class="notification-item"
            [class.notification-item--urgent]="notif.urgency"
            >
            <div class="notification-item__icon">
              <mat-icon [color]="notif.urgency ? 'warn' : undefined">{{ notif.icon }}</mat-icon>
            </div>
            <div class="notification-item__content">
              <h3 class="notification-item__title">{{ notif.title }}</h3>
              <p class="notification-item__description">
                {{ notif.description }}
                <span class="notification-item__tag">{{ notif.tag }}</span>
              </p>
            </div>
            <div class="notification-item__actions"></div>
          </button>
        }
      </section>
    
    } @else {
      <section class="notification-list">
        <strong>No notification available yet</strong>
      </section>
    
    }
    `,
  styles: [`
  .notification-list {
      width: 100%;
      max-width: 500px;
      //border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      strong {
        color: var(--dp-gold);
        margin: 1em;
        padding: 1em;
      }
    }

    .notification-list__header {
      padding: 16px 20px;
      text-align: center;
      div {
        color: var(--dp-muted);
        cursor: pointer;
        font-size: 0.9em;
        margin-top: 0.5em;
      }
    }

    .notification-list__title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--dp-text);
    }

    .notification-list__divider {
      margin: 0;
      //padding-top: 0.5em;
      color: var(--dp-muted);
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 15px;
      text-align: left;
      white-space: normal;
      transition: background-color 0.15s ease-in-out;
      cursor: pointer;
      border: none;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background-color: var(--dp-paper);
      border-radius: 10px;
    }

    .notification-item--urgent {
      background-color: var(--dp-error-bg);
      border-left: 1px solid var(--dp-error);
    }

    .notification-item__icon {
      margin-right: 16px;
      margin-top: 2px;
    }

    .notification-item__icon mat-icon {
      font-size: 22px;
      height: 22px;
      width: 22px;
      color: var(--dp-muted);
    }

    .notification-item__content {
      flex-grow: 1;
    }

    .notification-item__title {
      margin: 0 0 6px 0;
      font-size: 1rem;
      font-weight: 500;
      color: var(--dp-text);
    }

    .notification-item--urgent .notification-item__title {
      color: var(--dp-error);
    }

    .notification-item__description {
      font-size: 0.875rem;
      margin: 0;
      color: var(--dp-text);
      line-height: 1.4;
    }

    .notification-item__tag {
      display: inline-block;
      font-size: 0.7rem;
      color: var(--dp-gold-ink);
      background-color: var(--dp-gold-soft);
      padding: 2px 6px;
      //border-radius: 4px;
      margin-top: 6px;
    }

    .notification-item__actions {
      margin-left: 16px;
      opacity: 0.8;
    }
  `],
  imports: [
    MatIconModule,
    MatDividerModule
],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [PushNotificationService]
})
export class PushNotificationsComponent implements OnInit {
  notifications: Array<PushNotificationInterface> = [];

  @Input() partner!: PartnerInterface;
  noNotifications = false;

  @Output() notificationCountChange = new EventEmitter<number>(); // EventEmitter to send data to parent


    constructor(
      private notifier: PushNotificationService,
      private router: Router,
    ) { }

  ngOnInit(): void {
    // One-shot HTTP — self-completes, no tracking needed.
    this.notifier.getNotifications(this.partner._id).subscribe({
          next: (response) => {
          if (response.success) {
            this.notifications = response.data;
            this.notifyParent();

          }
        }
      })

  }

  private notifyParent() {
    const count = this.notifications.length; // Example: Sending the count of notifications
    this.notificationCountChange.emit(count); // Emit the value to the parent
  }

  listAllNotifications() {
    this.router.navigateByUrl('dashboard/settings/notifications');
  }
  
}

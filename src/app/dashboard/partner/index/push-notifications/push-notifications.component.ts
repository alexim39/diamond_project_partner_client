import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { PushNotificationInterface, PushNotificationService } from './push-notifications.service';

@Component({
  selector: 'async-push-notifications',
  template: `
    @if (notifications.length > 0) {

      <section class="notification-list">
      <div class="notification-list__header">
        <h2 class="notification-list__title">Follow-ups Notifications</h2>
      </div>

      <mat-divider class="notification-list__divider" />

      <button mat-menu-item
              class="notification-item"
              [class.notification-item--urgent]="notif.urgency"
              *ngFor="let notif of notifications">
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
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      strong {
        color: orange;
        margin: 1em;
        padding: 1em;
      }
    }

    .notification-list__header {
      padding: 16px 20px;
      text-align: left;
    }

    .notification-list__title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: #212121;
    }

    .notification-list__divider {
      margin: 0;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 20px;
      text-align: left;
      white-space: normal;
      transition: background-color 0.15s ease-in-out;
      cursor: pointer;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background-color: #f5f5f5;
    }

    .notification-item--urgent {
      background-color: #ffebee;
      border-left: 1px solid #c62828;
    }

    .notification-item__icon {
      margin-right: 16px;
      margin-top: 2px;
    }

    .notification-item__icon mat-icon {
      font-size: 22px;
      height: 22px;
      width: 22px;
      color: rgba(0, 0, 0, 0.7);
    }

    .notification-item__content {
      flex-grow: 1;
    }

    .notification-item__title {
      margin: 0 0 6px 0;
      font-size: 1rem;
      font-weight: 500;
      color: #212121;
    }

    .notification-item--urgent .notification-item__title {
      color: #b71c1c;
    }

    .notification-item__description {
      font-size: 0.875rem;
      margin: 0;
      color: #424242;
      line-height: 1.4;
    }

    .notification-item__tag {
      display: inline-block;
      font-size: 0.7rem;
      color: #1a237e;
      background-color: #e0e0e0;
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 6px;
    }

    .notification-item__actions {
      margin-left: 16px;
      opacity: 0.8;
    }
  `],
  imports: [
    MatIconModule,
    MatDividerModule,
    CommonModule
  ],
  providers: [PushNotificationService]
})
export class PushNotificationsComponent implements OnInit, OnDestroy {
  notifications: Array<PushNotificationInterface> = [];

  @Input() partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  noNotifications = false;

  @Output() notificationCountChange = new EventEmitter<number>(); // EventEmitter to send data to parent


    constructor(
      private notifier: PushNotificationService,
    ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.notifier.getNotifications(this.partner._id).subscribe({
          next: (response) => {
            //console.log(response)
          if (response.success) {
            this.notifications = response.data;
            this.notifyParent();

          }   
        }
      })
    )

  }

   ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private notifyParent() {
    const count = this.notifications.length; // Example: Sending the count of notifications
    this.notificationCountChange.emit(count); // Emit the value to the parent
  }
  
}

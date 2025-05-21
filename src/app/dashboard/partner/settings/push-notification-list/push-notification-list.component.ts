import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { RouterModule } from '@angular/router';
import { PushNotificationInterface, PushNotificationService } from '../../index/push-notifications/push-notifications.service';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
selector: 'async-push-notification-list',
template: `

<section class="breadcrumb-wrapper">
  <div class="breadcrumb">
    <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Dashboard</a> &gt;
    <a>Tools</a> &gt;
    <span>notifications</span>
  </div>
</section>

<section class="async-background">
  <h2>Push Notifications <mat-icon (click)="showDescription()">help</mat-icon></h2>

  <section class="async-container">
    <div class="push-notification-list">
      @if (notifications.length) {
        <ul>
          <li *ngFor="let notification of notifications" class="notification-item">
            <div class="notification-content">
              <div>
                <h3><mat-icon>{{ notification.icon }}</mat-icon> {{ notification.title }}</h3>
                <p>{{ notification.description }}</p>
                <!-- <p *ngIf="notification.tag"><strong>Tag:</strong> {{ notification.tag }}</p> -->
                <p *ngIf="notification.urgency"><strong style="color: red;">Urgent</strong></p>
                <!-- <p *ngIf="notification.prospectId"><strong>Prospect ID:</strong> {{ notification.prospectId }}</p> -->

                <!-- Status Info -->
                <div *ngIf="notification.status">
                  <h4>Status Informations</h4>
                  <!-- <ul>
                    <li *ngFor="let key of getKeys(notification.status)">
                      <strong>{{ key }}:</strong> {{ notification.status[key] }}
                    </li>
                  </ul> -->
                  <ul>
                    <li>
                        <strong>Info: </strong> {{ notification.status.name ? notification.status.name : 'Not captured' }}
                    </li>
                    <li>
                        <strong>Note: </strong> {{ notification.status.note ? notification.status.note : 'Not captured' }}
                    </li>
                    <li>
                        <strong>Expected Decision Date: </strong> {{ notification.status.expectedDecisionDate ? (notification.status.expectedDecisionDate | date) : 'No date' }}
                    </li>
                  </ul>
                </div>

                <!-- Communication Info -->
                <div *ngIf="notification.communication">
                  <h4>Last Communication</h4>
                 <!--  <ul>
                    <li *ngFor="let key of getKeys(notification.communication)">
                      <strong>{{ key }}:</strong> {{ notification.communication[key] }}
                    </li>
                  </ul> -->
                  <ul>
                    <li>
                        <strong>Communication Type: </strong> {{ notification.communication.type ? notification.communication.type : 'Not captured' }}
                    </li>
                    <li>
                        <strong>Duration: </strong> {{ notification.communication.duration ? notification.communication.duration+'min' : 'Not captured'}}
                    </li>
                    <li>
                        <strong>Description: </strong> {{ notification.communication.description ? notification.communication.description : 'Not captured' }}
                    </li>
                    <li>
                        <strong>Interest Level: </strong> {{ notification.communication.interestLevel ? notification.communication.interestLevel : 'Not available' }}
                    </li>
                    <li>
                        <strong>Expected Date: </strong> {{ notification.communication.date ? (notification.communication.date | date) : 'No date' }}
                    </li>
                  </ul>
                </div>

                <small *ngIf="notification.status?.createdAt">Created date: {{ notification.status.createdAt | date }}</small>
              </div>

              <div class="notification-actions">
                <button mat-mini-fab color="warn" aria-label="Delete" style="color: red;" (click)="closeNotification(notification)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
          </li>
        </ul>
      } @else {
        <p class="no-record">No push notifications available.</p>
      }
    </div>
  </section>
</section>






`,
imports: [CommonModule, MatIconModule, RouterModule, MatButtonModule],
styles: [`

.async-background {
    margin: 2em;
    h2 {
        mat-icon {
            cursor: pointer;
        }
    }
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .action-area {
                .action {
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.5em 0;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
        }       

        .no-record {
            text-align: center;
            color: rgb(196, 129, 4);
            font-weight: bold;
        }
    }
}

.container {
    margin-top: 1em;
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
}

@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

.push-notification-list {
        padding: 1rem;
}
ul {
    list-style: none;
    padding: 0;
    li {
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 1rem;
        padding: 1rem;
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            .notification-actions {
                display: flex;
                gap: 0.5rem;
                margin-left: 1rem;
                button {
                    transition: background 0.2s;
                }
                button:hover {
                    background: #f5f5f5;
                }
            }
        }
    }
}

h3 {
    margin: 0 0 0.5rem;
}
p {
    margin: 0 0 0.5rem;
}
small {
    color: #666;
}

/* .tag {
  display: inline-block;
  padding: 0.2em 0.6em;
  background: #eee;
  color: #333;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 0.25em;
}

.urgent {
  border-left: 5px solid red;
  background-color: #ffe6e6;
}
 */

`],
})
export class PushNotificationListComponent implements OnDestroy {
    @Input() partner!: PartnerInterface;
    @Input() notifications: Array<PushNotificationInterface> = [];
    readonly dialog = inject(MatDialog);

  subscriptions: Subscription[] = [];

    getKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    constructor(
        private notifier: PushNotificationService,
    ) { }
     
    showDescription () {
        this.dialog.open(HelpDialogComponent, {
        data: {help: `
            Here, you can effortlessly manage all push notification available to your profile.
        `},
        });
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    closeNotification(notification: PushNotificationInterface) {
      //console.log('Close notification:', notification);

        Swal.fire({
        title: "Confirm marking notification as completed",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Mark it!"
        }).then((result) => {
            if (result.isConfirmed) {

                    this.subscriptions.push(
                    this.notifier.MarkNotificationAsClosed(notification.prospectId, notification.status._id).subscribe({

                        next: (response) => {
                            // Remove the closed notification from the UI list
                            this.notifications = this.notifications.filter(
                                n => n !== notification
                            );

                            Swal.fire({
                                position: "bottom",
                                icon: 'success',
                                text: response.message,
                                showConfirmButton: true,
                                timer: 10000,
                                confirmButtonColor: "#ffab40",
                            });
                        },
                        error: (error: HttpErrorResponse) => {
                            let errorMessage = 'Server error occurred, please try again.'; // default error message.
                            if (error.error && error.error.message) {
                                errorMessage = error.error.message; // Use backend's error message if available.
                            }
                            Swal.fire({
                                position: "bottom",
                                icon: 'error',
                                text: errorMessage,
                                showConfirmButton: false,
                                timer: 4000
                            });  
                        }
                    })
                )
            }
        })
}

     ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
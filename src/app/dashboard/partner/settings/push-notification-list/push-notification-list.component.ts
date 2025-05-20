import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { RouterModule } from '@angular/router';
import { PushNotificationInterface } from '../../index/push-notifications/push-notifications.service';

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
  
<section class="async-background ">
    <h2>Push Notifications <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">



    
    <div class="push-notification-list">
        <!-- <h2>Push Notifications</h2> -->
        <ul *ngIf="notifications.length; else noNotifications">
            <li *ngFor="let notification of notifications">
                <h3>{{ notification.title }}</h3>
                <p>{{ notification.description }}</p>
                <!-- <small>Sent on: {{ notification.sentDate | date }}</small> -->
            </li>
        </ul>
        <ng-template #noNotifications>
            <p>No push notifications available.</p>
        </ng-template>
    </div>



        
    </section>
    
</section>




`,
imports: [CommonModule, MatIconModule, RouterModule],
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

        .no-campaign {
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
}
li {
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 1rem;
    padding: 1rem;
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
`],
})
export class PushNotificationListComponent {
    @Input() partner!: PartnerInterface;
    @Input() notifications: Array<PushNotificationInterface> = [];
    readonly dialog = inject(MatDialog);

    constructor(){
        console.log(this.notifications)
    }
     
   /*  notifications = [
        { title: 'Welcome', message: 'Welcome to our platform!', sentDate: new Date() },
        { title: 'Update', message: 'We have updated our terms of service.', sentDate: new Date() }
    ]; */

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
}
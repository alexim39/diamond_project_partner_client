import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ProfileMgrComponent } from './profile-mgr.component';
import {MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { NotificationsSettingsComponent } from '../notifications/notifications.component';

/**
 * @title Container
 */
@Component({
selector: 'async-profile-mgr-container',
template: `

<section class="async-background">
  <h2>Account Settings <mat-icon class="help" (click)="showDescription()">help</mat-icon></h2>

  <section class="async-container">
      <div class="title">
          <h1>Account Profile Manager</h1>
          <div class="fund-area">
            <a mat-raised-button><mat-icon>edit</mat-icon>Edit Profile</a>
          </div>
      </div>


    <mat-tab-group>
      <mat-tab label="Profile Settings"> 
        <async-profile-mgr *ngIf="partner" [partner]="partner" />
      </mat-tab>
      <mat-tab label="Notification Settings"> 
        <async-notifications-settings *ngIf="partner" [partner]="partner" />
      </mat-tab>
    </mat-tab-group>
  </section>
</section>

`,
providers: [],
imports: [CommonModule, ProfileMgrComponent, MatTabsModule, MatIconModule, MatButtonModule, NotificationsSettingsComponent],
styles: [`

.async-background {
  margin: 2em;
    .help {
    cursor: pointer;
  }
  .async-container {
      background-color: #dcdbdb;
      border-radius: 1%;
      height: 100%;
      padding: 1em;
      .title {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ccc;
        padding: 1em;
        .fund-area {
          .fund {
            //display: flex;
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
  }
}

`]
})
export class ProfileMrgContainerComponent implements OnInit, OnDestroy {

  //partner = signal<PartnerInterface>({});

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  readonly dialog = inject(MatDialog);

  constructor(
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        }
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

   showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: 'In this section, you can set up your account page information'},
      });
    }
}
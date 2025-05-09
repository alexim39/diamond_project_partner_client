import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ProfileMgrComponent } from './profile-mgr.component';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Container
 */
@Component({
  selector: 'async-profile-mgr-container',
  template: `

<mat-tab-group>
  <mat-tab label="Profile Settings"> 
    <async-profile-mgr *ngIf="partner" [partner]="partner" />
  </mat-tab>
  <mat-tab label="Notification Settings"> 
    <p>Notification Management</p>
  </mat-tab>
  <!-- <mat-tab label="Third"> Content 3 </mat-tab> -->
</mat-tab-group>


  `,
  providers: [],
  imports: [CommonModule, ProfileMgrComponent, MatTabsModule]
})
export class ProfileMrgContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

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
}
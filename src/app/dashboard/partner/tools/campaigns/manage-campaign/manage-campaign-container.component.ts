import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ManageCampaignComponent } from './manage-campaign.component';
import { CampaignInterface, CampaignService } from './manage-campaign.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';


/**
 * @title Manage comapaing container
 */
@Component({
selector: 'async-manage-campaign-container',
imports: [CommonModule, ManageCampaignComponent, MatIconModule, MatButtonModule],
providers: [CampaignService],
template: `
 @if(isEmptyRecord) {
    <div class="container">
      <p class="no-content">
        <!-- Something Went Wrong or may be you dont have logs yet! -->
         {{serverErrorMessage}} or Something went wrong

      </p>
      <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
    </div>
 } @else {
 <async-manage-campaign *ngIf="partner && campaigns" [partner]="partner" [campaigns]="campaigns"/> }

`,
styles: `
   .container {
     padding: 2em;
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;
   }
   .no-content {
     color: rgb(196, 129, 4);
     font-weight: bold;
   }
    
`
})
export class ManageCampaignContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  campaigns!: CampaignInterface[];
  subscriptions: Subscription[] = [];
  isEmptyRecord = false;
  serverErrorMessage = '';
  
  constructor(
    private partnerService: PartnerService,
    private campaignService: CampaignService,
    private router: Router,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.subscriptions.push(
              this.campaignService.getCampaignCreatedBy(this.partner._id).subscribe({
                next: (response) => {
                  //console.log(response)
                  if (response.success) {
                    this.campaigns = response.data;
                  }
                },
                error: (error: HttpErrorResponse) => {
                  this.isEmptyRecord = true;
                  this.serverErrorMessage = error.error.message;
                }
              })
            )
          }
        }
      })
    )
  }

   back(): void {
    //window.history
   this.router.navigateByUrl('dashboard/tools/campaigns/new');
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
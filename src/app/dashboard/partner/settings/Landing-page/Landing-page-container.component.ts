import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';


/**
 * @title Manage comapaing container
 */
@Component({
  selector: 'async-landing-page-setting-container',
  standalone: true,
  imports: [CommonModule,],
  providers: [],
  template: `
  <!-- <async-manage-campaign *ngIf="partner && campaigns" [partner]="partner" [campaigns]="campaigns"></async-manage-campaign> -->
  `,
})
export class LandingPageSettingContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  campaigns!: any;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
    //private campaignService: CampaignService
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
           /*  this.campaignService.getCampaignCreatedBy(this.partner._id).subscribe((campaigns: CampaignInterface) => {
              this.campaigns = campaigns;
              //console.log('campaign ',campaigns)
            }) */
          }
        },
        
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ManageCampaignComponent } from './manage-campaign.component';
import { CampaignInterface, CampaignService } from './manage-campaign.service';


/**
 * @title Manage comapaing container
 */
@Component({
    selector: 'async-manage-campaign-container',
    imports: [CommonModule, ManageCampaignComponent],
    providers: [CampaignService],
    template: `
  <async-manage-campaign *ngIf="partner && campaigns" [partner]="partner" [campaigns]="campaigns"/>
  `
})
export class ManageCampaignContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  campaigns!: CampaignInterface;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
    private campaignService: CampaignService
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.campaignService.getCampaignCreatedBy(this.partner._id).subscribe((campaigns: CampaignInterface) => {
              this.campaigns = campaigns;
            })
          }
        }
    })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
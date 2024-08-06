import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ManageCampaignComponent } from './manage-campaign.component';
import { CampaignInterface, ManageCampaignService } from './manage-campaign.service';


/**
 * @title Manage comapaing container
 */
@Component({
  selector: 'async-manage-campaign-container',
  standalone: true,
  imports: [CommonModule, ManageCampaignComponent],
  providers: [ManageCampaignService],
  template: `
  <async-manage-campaign *ngIf="partner && campaigns" [partner]="partner" [campaigns]="campaigns"></async-manage-campaign>
  `,
})
export class ManageCampaignContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  campaigns!: CampaignInterface;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
    private manageCampaignService: ManageCampaignService
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            this.manageCampaignService.getCampaignCreatedBy(this.partner._id).subscribe((campaigns: CampaignInterface) => {
              this.campaigns = campaigns;
              //console.log('campaign ',campaigns)
            })
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
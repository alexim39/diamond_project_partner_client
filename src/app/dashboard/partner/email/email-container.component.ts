import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { EmailComponent } from './email.component';


/**
 * @title cell meeting container
 */
@Component({
    selector: 'async-email-container',
    imports: [CommonModule, EmailComponent],
    providers: [],
    template: `
  <async-email *ngIf="partner" [partner]="partner"></async-email>
  `
})
export class EmailContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            //console.log('=',this.partner)
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
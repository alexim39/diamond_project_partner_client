import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { CampaignAnalyticsComponent } from './campaign-analytics.component';
import { ProspectService, ProspectListInterface } from '../prospects.service';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-prospect-list-container',
    imports: [CommonModule, CampaignAnalyticsComponent],
    providers: [ProspectService],
    template: `
  <async-campaign-analytics *ngIf="partner && prospectList" [partner]="partner" [prospectList]="prospectList"></async-campaign-analytics>
  `
})
export class CampaignAnalyticsContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  prospectList!: ProspectListInterface;

  constructor(
    private partnerService: PartnerService,
    private prospectService: ProspectService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.prospectService.getProspectFor(this.partner._id).subscribe((prospectContact: ProspectListInterface) => {
              //this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
              ///console.log('partner ',this.partner)
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
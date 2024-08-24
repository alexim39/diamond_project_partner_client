import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { CampaignAnalyticsComponent } from './campaign-analytics.component';
import { AnalyticsService, ProspectListInterface } from '../analytics.service';


/**
 * @title contacts container
 */
@Component({
  selector: 'async-prospect-list-container',
  standalone: true,
  imports: [CommonModule, CampaignAnalyticsComponent],
  providers: [AnalyticsService],
  template: `
  <async-campaign-analytics *ngIf="partner && prospectList" [partner]="partner" [prospectList]="prospectList"></async-campaign-analytics>
  `,
})
export class CampaignAnalyticsContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  prospectList!: ProspectListInterface;

  constructor(
    private partnerService: PartnerService,
    private prospectListService: AnalyticsService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            this.prospectListService.getProspectFor(this.partner._id).subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
              ///console.log('partner ',this.partner)
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
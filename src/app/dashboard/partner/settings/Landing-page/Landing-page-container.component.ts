import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { LandingPageSettingComponent } from './Landing-page.component';


/**
 * @title Manage comapaing container
 */
@Component({
    selector: 'async-landing-page-setting-container',
    imports: [CommonModule, LandingPageSettingComponent],
    providers: [],
    template: `
  <async-landing-page-setting *ngIf="partner" [partner]="partner"/>
  `
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
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        },
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
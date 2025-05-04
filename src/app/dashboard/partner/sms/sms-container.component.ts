import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { smsComponent } from './sms.component';


/**
 * @title cell meeting container
 */
@Component({
    selector: 'async-sms-container',
    imports: [CommonModule, smsComponent],
    providers: [],
    template: `
  <async-sms *ngIf="partner" [partner]="partner"/>
  `
})
export class smsContainerComponent implements OnInit, OnDestroy {

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
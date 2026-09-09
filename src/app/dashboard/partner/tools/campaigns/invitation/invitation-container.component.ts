import {Component, OnDestroy, OnInit} from '@angular/core';

import { InvitationComponent } from './invitation.component';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';

/**
 * @title Container
 */
@Component({
    selector: 'async-invitation-container',
    template: `
  @if (partner) {
    <async-invitation [partner]="partner"/>
  }
  `,
    providers: [],
    imports: [InvitationComponent]
})
export class InvitationContainerComponent implements OnInit, OnDestroy {

    
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
import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { SubmitTicketComponent } from './submit-ticket.component';


/**
 * @title cell meeting container
 */
@Component({
    selector: 'async-submit-ticket-container',
    imports: [CommonModule, SubmitTicketComponent],
    providers: [],
    template: `
  <async-submit-ticket *ngIf="partner" [partner]="partner"/>
  `
})
export class SubmitTicketContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partnerObject) => {
            this.partner = partnerObject as PartnerInterface
        }
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { BillingComponent } from './billing.component';
import { PaystackService, TransactionInterface } from './paystack.service';


/**
 * @title Manage comapaing container
 */
@Component({
    selector: 'async-billing-container',
    imports: [CommonModule, BillingComponent],
    providers: [],
    template: `
  <async-billing *ngIf="partner && transactions" [partner]="partner"  [transactions]="transactions"></async-billing>
  `
})
export class BillingContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  transactions!: TransactionInterface;

  constructor(
    private partnerService: PartnerService,
    private paystackService: PaystackService
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            // get transaction list
            this.subscriptions.push(
              this.paystackService.getTransactions(this.partner._id).subscribe((transactions: TransactionInterface) => {
                //console.log('t=',transactions)
                this.transactions = transactions;
              })
            )
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
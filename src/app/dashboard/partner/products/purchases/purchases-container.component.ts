import {Component, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { ProductObjectInterface, ProductService } from '../monthly-purchase.service';
import { Subscription } from 'rxjs';

import { PurchasesComponent } from './purchases.component';

/**
 * @title Basic icons
 */
@Component({
    selector: 'async-purchases-container',
    template: `
    @if (cartObject) {
      <async-purchases [cartObject]="cartObject"/>
    }
    `,
    providers: [ProductService],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatIconModule, PurchasesComponent]
})
export class PurchaseContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  cartObject!: any;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
    private productService: ProductService
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.productService.getAllOrderBy(this.partner._id).subscribe((cartObject: ProductObjectInterface) => {
              this.cartObject = cartObject.data;
              //console.log('product ',cartObject)
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
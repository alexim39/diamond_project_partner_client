import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { ProductObjectInterface, ProductService } from '../monthly-purchase.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PurchasesComponent } from './purchases.component';

/**
 * @title Basic icons
 */
@Component({
    selector: 'async-purchases-container',
    template: `
    <async-purchases *ngIf="cartObject" [cartObject]="cartObject"/>
  `,
    providers: [ProductService],
    imports: [MatIconModule, CommonModule, PurchasesComponent]
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
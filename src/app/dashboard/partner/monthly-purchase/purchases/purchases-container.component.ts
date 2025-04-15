import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MonthlyPurchaseComponent } from '../monthly-purchase.component';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { ProductInterface, ProductObjectInterface, ProductService } from '../monthly-purchase.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PurchasesComponent } from './purchases.component';

/**
 * @title Basic icons
 */
@Component({
    selector: 'async-purchases-container',
    template: `
    <async-purchases *ngIf="cartObject" [cartObject]="cartObject"></async-purchases>
  `,
    providers: [ProductService],
    imports: [MatIconModule, MonthlyPurchaseComponent, CommonModule, PurchasesComponent]
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
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            this.productService.getAllOrderBy(this.partner._id).subscribe((cartObject: ProductObjectInterface) => {
              this.cartObject = cartObject;
              //console.log('product ',cartObject)
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
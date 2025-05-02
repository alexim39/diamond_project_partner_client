import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { MonthlyPurchaseComponent } from './monthly-purchase.component';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { ProductObjectInterface, ProductService } from './monthly-purchase.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

/**
 * @title Monthly purchase container
 */
@Component({
    selector: 'async-monthly-purchase-container',
    template: `
    <async-monthly-purchase *ngIf="productsObject" [productsObject]="productsObject"></async-monthly-purchase>
  `,
    providers: [ProductService],
    imports: [MatIconModule, MonthlyPurchaseComponent, CommonModule]
})
export class MonthlyPurchaseContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  productsObject!: ProductObjectInterface;
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
            this.productService.getAllProducts().subscribe((productsObject: ProductObjectInterface) => {
              this.productsObject = productsObject;
              //console.log('product ',productsObject)
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
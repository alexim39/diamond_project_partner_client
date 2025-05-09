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
    <async-monthly-purchase *ngIf="productsObject" [productsObject]="productsObject"/>
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
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.productService.getAllProducts().subscribe((productsObject: ProductObjectInterface) => {
              this.productsObject = productsObject;
              //console.log('product ',productsObject)
            })
          }
        },
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
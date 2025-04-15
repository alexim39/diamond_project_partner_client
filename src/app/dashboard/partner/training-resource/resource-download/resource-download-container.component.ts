import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ResourceDownloadComponent } from './resource-download.component';

/**
 * @title Monthly purchase container
 */
@Component({
    selector: 'async-resource-download-container',
    template: `
    <async-resource-download *ngIf="partner" [partner]="partner"></async-resource-download>
  `,
    providers: [],
    imports: [MatIconModule, CommonModule, ResourceDownloadComponent]
})
export class ResourceDownloadContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(

        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            /*  this.productService.getAllProducts().subscribe((productsObject: ProductObjectInterface) => {
               this.productsObject = productsObject;
               //console.log('product ',productsObject)
             }) */
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
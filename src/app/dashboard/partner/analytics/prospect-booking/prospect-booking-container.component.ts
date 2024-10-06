import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ProspectBookingComponent } from './prospect-booking.component';
import { AnalyticsService, ProspectListInterface } from '../analytics.service';


/**
 * @title contacts container
 */
@Component({
  selector: 'async-prospect-booking-container',
  standalone: true,
  imports: [CommonModule, ProspectBookingComponent],
  providers: [AnalyticsService],
  template: `
  <async-prospect-booking *ngIf="partner && prospectList" [partner]="partner" [prospectList]="prospectList"></async-prospect-booking>
  `,
})
export class ProspectBookingContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  prospectList!: ProspectListInterface;

  constructor(
    private partnerService: PartnerService,
    private prospectListService: AnalyticsService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            this.prospectListService.getSessionBookingsFor(this.partner._id).subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
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
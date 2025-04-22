import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { MyProspectListComponent } from './my-prospect-list.component';
import { AnalyticsService, ProspectListInterface } from '../analytics.service';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-my-prospect-list-container',
    imports: [CommonModule, MyProspectListComponent],
    providers: [AnalyticsService],
    template: `
  <async-my-prospect-list *ngIf="partner && prospectList" [partner]="partner" [prospectList]="prospectList"/>
  `
})
export class MyProspectListContainerComponent implements OnInit, OnDestroy {

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
      this.partnerService.getSharedPartnerData$.subscribe({
        next:  (partnerObject) => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            this.prospectListService.getAllMyProspect(this.partner.username).subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
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
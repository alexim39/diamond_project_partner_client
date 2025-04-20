import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ProspectListComponent } from './prospect-list.component';
import { AnalyticsService, ProspectListInterface } from '../analytics.service';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-prospect-list-container',
    imports: [CommonModule, ProspectListComponent],
    providers: [AnalyticsService],
    template: `
  <async-prospect-list *ngIf="partner && prospectList" [partner]="partner" [prospectList]="prospectList"></async-prospect-list>
  `
})
export class ProspectListContainerComponent implements OnInit, OnDestroy {

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
            this.prospectListService.getAllProspect().subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
            })
           /*  this.prospectListService.getProspectFor(this.partner._id).subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
            }) */
          }
        }
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
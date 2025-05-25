import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ProspectListComponent } from './prospect-list.component';
import { ProspectService, ProspectListInterface } from '../prospects.service';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-prospect-list-container',
    imports: [CommonModule, ProspectListComponent],
    providers: [ProspectService],
    template: `
  <async-prospect-list *ngIf="partner && prospectList" [partner]="partner" [prospectList]="prospectList"/>
  `
})
export class ProspectListContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  prospectList: ProspectListInterface[] = [];

  constructor(
    private partnerService: PartnerService,
    private prospectListService: ProspectService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next:  (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.prospectListService.getAllProspect().subscribe({
              next: (response) => {
                this.prospectList = response.data;
              },
              error: () => {
                this.prospectList = [];
              }
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
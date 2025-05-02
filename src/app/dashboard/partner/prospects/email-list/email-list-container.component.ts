import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { EmailListComponent } from './email-list.component';
import { ProspectService, ProspectListInterface } from '../prospects.service';


/**
 * @title prospect email list container
 */
@Component({
    selector: 'async-email-list-container',
    imports: [CommonModule, EmailListComponent],
    providers: [ProspectService],
    template: `
  <async-email-list *ngIf="partner && prospectList" [partner]="partner" [prospectList]="prospectList"/>
  `
})
export class EmailListContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  prospectList!: ProspectListInterface;

  constructor(
    private partnerService: PartnerService,
    private prospectListService: ProspectService,
  ) { }

  ngOnInit() {

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.prospectListService.getEmailList(this.partner._id).subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectEmais ',prospectContact)
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { ManageContactsComponent } from './manage-contacts.component';
import { ContactsInterface, ContactsService } from '../contacts.service';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-manage-contacts-container',
    imports: [ManageContactsComponent],
    providers: [ContactsService],
    template: `
  @if (partner && prospectContact) {
    <async-manage-contatcs [partner]="partner" [prospectContact]="prospectContact"/>
  }
  `
})
export class ManageContactsContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  prospectContact: ContactsInterface[] = [];

  constructor(
    private partnerService: PartnerService,
    private contactsService: ContactsService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partnerObject) => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            this.contactsService.getContactsCreatedBy(this.partner._id).subscribe({
              next: (response) => {
                if (response.success) {
                  this.prospectContact = response.data;
                }
              },
              error: () => {
                this.prospectContact = [];
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
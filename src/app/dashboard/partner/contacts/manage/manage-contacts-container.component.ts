import { CommonModule } from '@angular/common';
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
    imports: [CommonModule, ManageContactsComponent],
    providers: [ContactsService],
    template: `
  <async-manage-contatcs *ngIf="partner && prospectContact" [partner]="partner" [prospectContact]="prospectContact"/>
  `
})
export class ManageContactsContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  prospectContact!: ContactsInterface;

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
            this.contactsService.getContctsCreatedBy(this.partner._id).subscribe((prospectContact: ContactsInterface) => {
              this.prospectContact = prospectContact;
              //console.log('prospectContact ',prospectContact)
            })
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
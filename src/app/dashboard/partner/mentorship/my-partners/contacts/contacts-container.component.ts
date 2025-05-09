import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { MyPartnersContactsComponent } from './contacts.component';
import { ContactsInterface, ContactsService } from './contacts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MyPartnersService } from '../my-partners.service';


/**
 * @title partners contacts container
 */
@Component({
    selector: 'async-manage-contacts-container',
    imports: [CommonModule, MyPartnersContactsComponent],
    providers: [ContactsService, MyPartnersService],
    template: `
  <async-my-partners-contatcs *ngIf="partner && partnerContacts && myPartner" [partner]="partner" [partnerContacts]="partnerContacts" [myPartner]="myPartner"/>
  `
})
export class MyPartnersContactsContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  partnerContacts!: ContactsInterface;
  myPartner!: PartnerInterface;
  myPartnerId!: string | null;
  isEmptyRecord = false;


  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private myPartnersService: MyPartnersService,
    private partnerService: PartnerService,
    private contactsService: ContactsService,
  ) { }

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.myPartnerId = params.get('id');
      if (this.myPartnerId) {
        // Fetch prospect details using the ID
        this.subscriptions.push(
          this.contactsService.getContctsCreatedBy(this.myPartnerId).subscribe({
            
            next: (partnerContacts: any) => {
              this.partnerContacts = partnerContacts;
            }, 
              error: (error) => {
                this.isEmptyRecord = true;
              }
          })
        );


        // Fetch partner details using the ID
        this.subscriptions.push(
          this.myPartnersService.getPartnerById(this.myPartnerId).subscribe({
            
            next: (partner) => {
              this.myPartner = partner.data;
            }
          })
        )
      }
    });

     // get current signed in user
     this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        },
    
      })
    )
    
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
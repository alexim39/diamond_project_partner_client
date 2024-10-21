import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { MyPartnersContactsComponent } from './contacts.component';
import { ContactsInterface, ContactsService } from './contacts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MyPartnersService } from '../my-partners.service';


/**
 * @title contacts container
 */
@Component({
  selector: 'async-manage-contacts-container',
  standalone: true,
  imports: [CommonModule, MyPartnersContactsComponent],
  providers: [ContactsService, MyPartnersService],
  template: `
  <async-my-partners-contatcs *ngIf="partner && partnerContacts && myPartner" [partner]="partner" [partnerContacts]="partnerContacts" [myPartner]="myPartner"></async-my-partners-contatcs>
  `,
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
          this.contactsService.getContctsCreatedBy(this.myPartnerId).subscribe((partnerContacts: any) => {
            this.partnerContacts = partnerContacts;
            //console.log('prospectContact ',partnerContacts)
          }, (error) => {
            this.isEmptyRecord = true;
          })
        );


        // Fetch partner details using the ID
        this.subscriptions.push(
          this.myPartnersService.getPartnerById(this.myPartnerId).subscribe(partner => {
            this.myPartner = partner.data;
            //console.log('the partner', this.myPartner)
          })
        )

              
      }
    });

     // get current signed in user
     this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
         /*  if (this.partner) {
            this.contactsService.getContctsCreatedBy(this.partner._id).subscribe((prospectContact: ContactsInterface) => {
              this.prospectContact = prospectContact;
              //console.log('prospectContact ',prospectContact)
            })
          } */
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
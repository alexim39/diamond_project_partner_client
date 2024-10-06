import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { BookSessionComponent } from './book-session.component';
import { ContactsInterface, ContactsService } from '../contacts.service';
import { ActivatedRoute, Router } from '@angular/router';


/**
 * @title contacts container
 */
@Component({
  selector: 'async-book-session-container',
  standalone: true,
  imports: [CommonModule, BookSessionComponent],
  providers: [ContactsService],
  template: `
  <async-book-session *ngIf="prospect && partner" [prospect]="prospect"  [partner]="partner"></async-book-session>
  `,
})
export class BookSessionContainerComponent implements OnInit, OnDestroy {

  prospect!: ContactsInterface;
  prospectId!: string | null;
  isEmptyRecord = false;
  subscriptions: Subscription[] = [];
  partner!: PartnerInterface;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private partnerService: PartnerService,
  ) { }

  back(): void {
    this.router.navigateByUrl('dashboard/manage-contacts');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.prospectId = params.get('id');
      if (this.prospectId) {
        // Fetch prospect details using the ID
        this.subscriptions.push(
          this.contactsService.getProspectById(this.prospectId).subscribe(prospect => {
            //console.log(prospect)
            this.prospect = prospect;
          }, error => {
            this.isEmptyRecord = true;
          })
        )
        
      }
    });

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          /* if (this.partner) {
            this.prospectListService.getProspectFor(this.partner._id).subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
              ///console.log('partner ',this.partner)
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
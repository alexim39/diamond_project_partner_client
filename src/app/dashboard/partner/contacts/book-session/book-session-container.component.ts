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
    imports: [CommonModule, BookSessionComponent],
    providers: [ContactsService],
    template: `
  <async-book-session *ngIf="prospect && partner" [prospect]="prospect"  [partner]="partner"/>
  `
})
export class BookSessionContainerComponent implements OnInit, OnDestroy {

  prospect!: ContactsInterface;
  prospectId!: string | null;
  subscriptions: Subscription[] = [];
  partner!: PartnerInterface;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private partnerService: PartnerService,
  ) { }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.prospectId = params.get('id');
      if (this.prospectId) {
        // Fetch prospect details using the ID
        this.subscriptions.push(
          this.contactsService.getProspectById(this.prospectId).subscribe({
            next: (response) => {
              this.prospect = response.data;
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
        }
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
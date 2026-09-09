import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MyPartnerContactsDetailComponent } from './contacts-detail.component';
import { ContactsInterface, ContactsService, } from '../contacts.service';
import { Subscription } from 'rxjs';
import { MyPartnersService } from '../../my-partners.service';
import { PartnerInterface } from '../../../../../../_common/services/partner.service';

@Component({
selector: 'async-manage-contacts-detail-container',
template: `
  @if (!isEmptyRecord) {
    @if (prospect) {
      <async-my-partner-contacts-detail [prospect]="prospect" [myPartner]="myPartner"/>
    }
  }
  @if (isEmptyRecord) {
    <div class="container">
      <p class="no-content">Something Went Wrong or may be you dont have contacts yet!</p>
      <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
    </div>
  }
  `,
providers: [ContactsService, MyPartnersService],
imports: [MyPartnerContactsDetailComponent, MatButtonModule, MatIconModule],
changeDetection: ChangeDetectionStrategy.Eager,
styles: `
  .container {
    padding: 2em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .no-content {
    color: rgb(196, 129, 4);
    font-weight: bold;
  }
   
  `
})
export class MyPartnerContactsDetailContainerComponent implements OnInit, OnDestroy {

  prospect!: ContactsInterface;
  myPartnerId!: string | null;
  isEmptyRecord = false;
  subscriptions: Subscription[] = [];
  myPartner!: PartnerInterface;

  constructor(
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private myPartnersService: MyPartnersService,

  ) { }

  back(): void {
    window.history.back(); // Go back to the previous page
  }

  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.myPartnerId = params.get('id');
        if (this.myPartnerId) {
          // Fetch prospect details using the ID
          this.subscriptions.push(
            this.contactsService.getProspectById(this.myPartnerId).subscribe({
              next: (prospect) => {
                this.prospect = prospect;
              },
              error: () => {
                this.isEmptyRecord = true;
              }
            })
          )          
        }
      });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
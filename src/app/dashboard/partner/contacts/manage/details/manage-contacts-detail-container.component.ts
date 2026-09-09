import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ManageContactsDetailComponent } from './manage-contacts-detail.component';
import { ContactsInterface, ContactsService } from '../../contacts.service';
import { Subscription } from 'rxjs';

@Component({
selector: 'async-manage-contacts-detail-container',
template: `
  @if (!isEmptyRecord) {
    @if (prospect) {
      <async-manage-contacts-detail [prospect]="prospect"/>
    }
  }
  @if (isEmptyRecord) {
    <div class="container">
      <p class="no-content">Something Went Wrong or may be you dont have contacts yet!</p>
      <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
    </div>
  }
  `,
providers: [ContactsService],
imports: [ManageContactsDetailComponent, MatButtonModule, MatIconModule],
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
export class ManageContactsDetailContainerComponent implements OnInit, OnDestroy {

  prospect!: ContactsInterface;
  prospectId!: string | null;
  isEmptyRecord = false;
  subscriptions: Subscription[] = [];

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService
  ) { }

  back(): void {
    //this.router.navigateByUrl('dashboard/tools/contacts/list');
    window.history.back(); 
  }

  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.prospectId = params.get('id');
        if (this.prospectId) {
          // Fetch prospect details using the ID
          this.subscriptions.push(
            this.contactsService.getProspectById(this.prospectId).subscribe({
              next: (prospect) => {
                this.prospect = prospect.data;
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

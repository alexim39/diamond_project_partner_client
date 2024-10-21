import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { EditContactsComponent } from './edit-contacts.component';
import { ContactsInterface, ContactsService } from '../contacts.service';
import { ActivatedRoute, Router } from '@angular/router';


/**
 * @title contacts container
 */
@Component({
  selector: 'async-edit-container',
  standalone: true,
  imports: [CommonModule, EditContactsComponent],
  providers: [ContactsService],
  template: `
  <async-edit-contatcs *ngIf="prospect" [prospect]="prospect"></async-edit-contatcs>
  `,
})
export class EditContactsContainerComponent implements OnInit, OnDestroy {

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
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}
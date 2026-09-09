
import {Component, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Subscription } from 'rxjs';
import { EditContactsComponent } from './edit-contacts.component';
import { ContactsInterface, ContactsService } from '../contacts.service';
import { ActivatedRoute, Router } from '@angular/router';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-edit-container',
    imports: [EditContactsComponent],
    providers: [ContactsService],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
  @if (prospect) {
    <async-edit-contatcs [prospect]="prospect"/>
  }
  `
})
export class EditContactsContainerComponent implements OnInit, OnDestroy {

  prospect!: ContactsInterface;
  prospectId!: string | null;
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
          this.contactsService.getProspectById(this.prospectId).subscribe({
            next: (response) => {
              //console.log(response)
              this.prospect = response.data;
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
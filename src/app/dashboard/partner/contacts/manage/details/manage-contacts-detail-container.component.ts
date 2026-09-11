import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { ManageContactsDetailComponent } from './manage-contacts-detail.component';
import { ContactsInterface, ContactsService } from '../../contacts.service';
import { filter, map, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class ManageContactsDetailContainerComponent implements OnInit {

  prospect!: ContactsInterface;
  prospectId!: string | null;
  isEmptyRecord = false;
  private readonly destroyRef = inject(DestroyRef);

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
    // Route params are infinite; the lookup is one-shot — switchMap
    // cancels the in-flight fetch on re-navigation instead of stacking.
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      map(params => params.get('id')),
      filter((id): id is string => id !== null),
      switchMap(id => {
        this.prospectId = id;
        // Fetch prospect details using the ID
        return this.contactsService.getProspectById(id);
      })
    ).subscribe({
      next: (prospect) => {
        this.prospect = prospect.data;
      }
    });
  }
}

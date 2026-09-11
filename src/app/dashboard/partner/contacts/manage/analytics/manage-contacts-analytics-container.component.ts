import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ManageContactsAnalyticsComponent } from './manage-contacts-analytics.component';
import { ContactsInterface, ContactsService } from '../../contacts.service';
import { filter, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'async-manage-contacts-analytics-container',
  template: `
  <ng-container *ngIf="!isEmptyRecord">
    <async-manage-contacts-analytics *ngIf="prospect" [prospect]="prospect"/>
  </ng-container>
    <ng-container *ngIf="isEmptyRecord">
        <div class="container">
          <p class="no-content">Something Went Wrong or may be you dont have contacts yet!</p>
          <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
        </div>
    </ng-container>
  `,
  standalone: true,
  providers: [ContactsService],
  imports: [ManageContactsAnalyticsComponent, CommonModule, MatButtonModule, MatIconModule],
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
export class ManageContactsAnalyticsContainerComponent implements OnInit {

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
    this.router.navigateByUrl('dashboard/manage-contacts');
  }

  ngOnInit(): void {
    // Route params are infinite; the lookup is one-shot — switchMap
    // cancels the in-flight fetch on re-navigation instead of stacking.
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(params => params.get('id') !== null),
      switchMap(params => {
        this.prospectId = params.get('id');
        // Fetch prospect details using the ID
        return this.contactsService.getProspectById(this.prospectId as string);
      })
    ).subscribe({
      next: prospect => {
        this.prospect = prospect;
      },
      error: () => {
        this.isEmptyRecord = true;
      }
    });
  }

  /*  browserBackHistory () {
     window.history.back();
   } */
}

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MyPartnersComponent } from './my-partners.component';
import { MyPartnersService } from './my-partners.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivateNewPartnerComponent } from './activate-new-partner.component';

/**
 * @title My Partners Container Component
 */
@Component({
    selector: 'async-my-partners-container',
    template: `
    <ng-container *ngIf="!isEmptyRecord">
      <async-my-partners
        *ngIf="partner && myPartners"
        [partner]="partner"
        [myPartners]="myPartners.data">
      </async-my-partners>
    </ng-container>

    <ng-container *ngIf="isEmptyRecord">
      <div class="container">
        <div class="btn-area">
          <button mat-raised-button class="activate-btn" (click)="activateNewPartner()">
            <mat-icon>card_membership</mat-icon>
            Activate New Partner
          </button>
        </div>

        <p class="no-content">
          Something went wrong, or maybe you don't have partners yet!
        </p>
        <button mat-flat-button class="back-btn" (click)="navigateBack()">
          <mat-icon>arrow_back</mat-icon>
          Go Back
        </button>
      </div>
    </ng-container>
  `,
    styles: [
        `
      .container {
        padding: 2em;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      .btn-area {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1.5em;
      }
      .activate-btn {
        //color: #fff;
        //font-weight: bold;
      }
      .no-content {
        color: #c48104;
        font-weight: bold;
        margin: 1em 0;
      }
      .back-btn {
        //background-color: #f1f1f1;
        //color: #000;
      }
    `,
    ],
    providers: [MyPartnersService],
    imports: [CommonModule, MyPartnersComponent, MatButtonModule, MatIconModule]
})
export class MyPartnersContainerComponent implements OnInit, OnDestroy {
  partner!: PartnerInterface;
  myPartners: any; //PartnerInterface[] = [];
  isEmptyRecord = false;

  private readonly destroy$ = new Subject<void>();
  readonly dialog = inject(MatDialog);

  constructor(
    private partnerService: PartnerService,
    private myPartnersService: MyPartnersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPartnerData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load partner data and associated partners
   */
  private loadPartnerData(): void {
    this.partnerService.getSharedPartnerData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (partnerObject) => {
          this.partner = partnerObject as PartnerInterface;
          if (this.partner) {
            this.fetchMyPartners(this.partner._id);
          } else {
            this.isEmptyRecord = true;
          }
        },
        () => {
          this.isEmptyRecord = true;
        }
      );
  }

  /**
   * Fetch partners associated with the current user
   */
  private fetchMyPartners(partnerId: string): void {
    this.myPartnersService.getPartnersOf(partnerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (myPartners) => {
          this.myPartners = myPartners;
          this.isEmptyRecord = myPartners.length === 0;
        },
        () => {
          this.isEmptyRecord = true;
        }
      );
  }

  /**
   * Open dialog to activate a new partner
   */
  activateNewPartner(): void {
    this.dialog.open(ActivateNewPartnerComponent, {
      data: this.partner,
    });
  }

  /**
   * Navigate back to the dashboard
   */
  navigateBack(): void {
    this.router.navigateByUrl('dashboard');
  }
}

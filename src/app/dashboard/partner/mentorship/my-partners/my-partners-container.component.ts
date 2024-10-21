import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { MyPartnersComponent } from './my-partners.component';
import { MyPartnersService } from './my-partners.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * @title Container
 */
@Component({
  selector: 'async-my-partners-container',
  template: `

  <ng-container *ngIf="!isEmptyRecord">
    <async-my-partners *ngIf="partner && myPartners" [partner]="partner" [myPartners]="myPartners"></async-my-partners>
  </ng-container>

  <ng-container *ngIf="isEmptyRecord">
    <div class="container">
      <p class="no-content">Something Went Wrong or maybe you don't have partners yet!</p>
      <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
    </div>
  </ng-container>

  `,
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
     
    `,
  standalone: true,
  providers: [MyPartnersService],
  imports: [CommonModule, MyPartnersComponent, MatButtonModule, MatIconModule],
})
export class MyPartnersContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  myPartners!: Array<PartnerInterface>;
  isEmptyRecord = false;

  constructor(
    private partnerService: PartnerService,
    private myPartnersService: MyPartnersService,
    private router: Router
  ) { }

  ngOnInit() {
    // Get current signed-in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface;
          if (this.partner) {
            this.myPartnersService.getPartnersOf(this.partner._id).subscribe(
              (myPartners: PartnerInterface[]) => {
                this.myPartners = myPartners;

                // Check if the returned myPartners array is empty
                if (!this.myPartners || this.myPartners.length === 0) {
                  this.isEmptyRecord = true;
                }
              },
              error => {
                // Trigger isEmptyRecord on error
                this.isEmptyRecord = true;
              }
            );
          } else {
            // Handle case when partner data is not available
            this.isEmptyRecord = true;
          }
        },
        error => {
          // Trigger isEmptyRecord on error fetching partner data
          this.isEmptyRecord = true;
        }
      )
    );
  }

  back(): void {
    this.router.navigateByUrl('dashboard');
  }

  ngOnDestroy() {
    // Unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}

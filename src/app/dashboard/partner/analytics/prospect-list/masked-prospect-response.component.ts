import { CommonModule } from '@angular/common';
import {Component, inject, Input, OnDestroy} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

/**
 * @title Prospect Detail 
 */
@Component({
selector: 'async-masked-prospect-response',
providers: [AnalyticsService],
styles: `
  span {
    color: gray;
  }
  .bolder {
    font-weight: bolder;
    color: black;
    margin-top: 5px;
  }
  `,
    template: `

<h2 mat-dialog-title>{{data.prospect.surname | titlecase}} {{data.prospect.name | titlecase}}'s Response</h2>

<mat-dialog-content>
  
<mat-list>

  <mat-list-item>
    <span matListItemTitle>Prospect age range:</span>
    <span matListItemLine class="bolder">{{data.prospect.ageRange}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect knew about us through:</span>
    <span matListItemLine class="bolder">{{data.prospect.referral}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item *ngIf="data.prospect.referralCode">
    <span matListItemTitle>Prospect was referred by:</span>
    <span matListItemLine class="bolder">{{data.prospect.referralCode}}</span>
    <small style="color: gray;"><em>Note that {{data.prospect.referralCode}} may be a partner in our business</em></small>
  </mat-list-item>
  <mat-divider *ngIf="data.prospect.referralCode"></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect favourite social media platforms:</span>
    <span matListItemLine class="bolder">{{data.prospect.socialMedia}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect online purchase frequency:</span>
    <span matListItemLine class="bolder">{{data.prospect.onlinePurchaseSchedule}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect motivation for joining online businesses:</span>
    <span matListItemLine class="bolder">{{data.prospect.primaryOnlineBusinessMotivation | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect Importance of passive income:</span>
    <span matListItemLine class="bolder">{{data.prospect.importanceOfPassiveIncome | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>
  
  <mat-list-item>
    <span matListItemTitle>Prospect employment status:</span>
    <span matListItemLine class="bolder">{{data.prospect.employedStatus | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect comfort with technology:</span>
    <span matListItemLine class="bolder">{{data.prospect.comfortWithTech}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Business time dedication:</span>
    <span matListItemLine class="bolder">{{data.prospect.onlineBusinessTimeDedication}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect Country:</span>
    <span matListItemLine class="bolder">{{data.prospect.country}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item >
    <span matListItemTitle>Prospect State of Origin:</span>
    <span matListItemLine class="bolder">{{data.prospect.state ? data.prospect.state : 'State not found'}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>
  
  <mat-list-item>
    <span matListItemTitle>Date of Visit</span>
    <span matListItemLine class="bolder">{{ data.prospect.createdAt | date:'fullDate' }} by {{ data.prospect.createdAt | date:'shortTime' }}</span>
  </mat-list-item>

</mat-list>


 <mat-accordion>
  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title> More Action </mat-panel-title>
      <!-- <mat-panel-description> This is a summary of the content </mat-panel-description> -->
    </mat-expansion-panel-header>
    <p style="color: gray;">Move prospect from survey list to contact list</p>
    <button mat-stroked-button (click)="moveToContact(data.prospect._id)">
      <mat-icon>move_location</mat-icon>
      Move to Contact
    </button>
    
  </mat-expansion-panel>
 </mat-accordion>

 <br><br><br>
</mat-dialog-content>

<mat-dialog-actions>
  <button mat-button (click)="close()">Ok</button>
</mat-dialog-actions>

  `,
    imports: [CommonModule, MatListModule, MatDialogModule, MatIconModule, MatExpansionModule, MatButtonModule, MatDividerModule, MatDialogTitle, MatDialogContent, MatDialogActions]
})
export class MaskedProspectResponseComponent implements OnDestroy {
  readonly dialogRef = inject(MatDialogRef<MaskedProspectResponseComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  subscriptions: Array<Subscription> = [];

  constructor(
      private analyticsService: AnalyticsService,
      private router: Router,
  ) {}

  close(): void {
    this.dialogRef.close();
    this.router.navigateByUrl('dashboard/prospect-list');
  }

  moveToContact(prospectId: string): void {
    Swal.fire({
      title: "Are you sure of moving prospect to contact list?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, move it!"
    }).then((result) => {
      if (result.isConfirmed) {

        const partnerId = this.data.partner._id;

        this.subscriptions.push(
          this.analyticsService.importSingle({ partnerId, prospectId }).subscribe({
            next: (response) => {
             if (response.success) {
              Swal.fire({
                position: "bottom",
                icon: 'success',
                text: response.message,//`Your have successfully moved prospect to contact list`,
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                confirmButtonText: "OK",
                timer: 15000,
              }).then((result) => {
                if (result.isConfirmed) {
                  //this.router.navigateByUrl('dashboard/prospect-list');
                  window.location.reload();
                }
              });
             }
            },
            error: (error: HttpErrorResponse) => {
              let errorMessage = 'Server error occurred, please try again.'; // default error message.
              if (error.error && error.error.message) {
                errorMessage = error.error.message; // Use backend's error message if available.
              }
              Swal.fire({
                position: "bottom",
                icon: 'error',
                text: errorMessage,
                showConfirmButton: false,
                timer: 4000
              });  
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
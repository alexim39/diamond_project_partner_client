import { CommonModule } from '@angular/common';
import {Component, inject, OnDestroy} from '@angular/core';
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

/**
 * @title Prospect Detail 
 */
@Component({
    selector: 'async-prospect-response',
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

<h2 mat-dialog-title>{{data.prospectSurname | titlecase}} {{data.prospectName | titlecase}}'s Response</h2>

<mat-dialog-content>
  
<mat-list>
  
  <mat-list-item>
    <span matListItemTitle>Prospect phone number:</span>
    <span matListItemLine class="bolder">{{data.prospectPhone}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect email address:</span>
    <span matListItemLine class="bolder">{{data.prospectEmail}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect age range:</span>
    <span matListItemLine class="bolder">{{data.survey.ageRange}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect knew about us through:</span>
    <span matListItemLine class="bolder">{{data.survey.referral}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item *ngIf="data.survey.referralCode">
    <span matListItemTitle>Prospect was referred by:</span>
    <span matListItemLine class="bolder">{{data.survey.referralCode}}</span>
    <small style="color: gray;"><em>Note that {{data.survey.referralCode}} may be a partner in our business</em></small>
  </mat-list-item>
  <mat-divider *ngIf="data.survey.referralCode"></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect favourite social media platforms:</span>
    <span matListItemLine class="bolder">{{data.survey.socialMedia}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect online purchase frequency:</span>
    <span matListItemLine class="bolder">{{data.survey.onlinePurchaseSchedule}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect motivation for joining online businesses:</span>
    <span matListItemLine class="bolder">{{data.survey.primaryOnlineBusinessMotivation | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect Importance of passive income:</span>
    <span matListItemLine class="bolder">{{data.survey.importanceOfPassiveIncome | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>
  
  <mat-list-item>
    <span matListItemTitle>Prospect employment status:</span>
    <span matListItemLine class="bolder">{{data.survey.employedStatus | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect comfort with technology:</span>
    <span matListItemLine class="bolder">{{data.survey.comfortWithTech}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Business time dedication:</span>
    <span matListItemLine class="bolder">{{data.survey.onlineBusinessTimeDedication}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect Country:</span>
    <span matListItemLine class="bolder">{{data.survey.country}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item >
    <span matListItemTitle>Prospect State of Origin:</span>
    <span matListItemLine class="bolder">{{data.survey.state ? data.survey.state : 'State not found'}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>
  
  <mat-list-item>
    <span matListItemTitle>Date of Visit</span>
    <span matListItemLine class="bolder">{{ data.createdAt | date:'fullDate' }} by {{ data.createdAt | date:'shortTime' }}</span>
  </mat-list-item>

</mat-list>


 <!-- <mat-accordion>
  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title> More Action </mat-panel-title>
    </mat-expansion-panel-header>
    <p style="color: gray;">Remove prospect from survey list</p>
    <button mat-stroked-button (click)="deleteProspect(data._id)" style="color: red;">
      <mat-icon>delete</mat-icon>
      Delete
    </button>
    
  </mat-expansion-panel>
 </mat-accordion> -->

 <br><br><br>
</mat-dialog-content>

<mat-dialog-actions>
  <button mat-button (click)="close()">Ok</button>
</mat-dialog-actions>

  `,
    imports: [CommonModule, MatListModule, MatDialogModule, MatIconModule, MatExpansionModule, MatButtonModule, MatDividerModule, MatDialogTitle, MatDialogContent, MatDialogActions]
})
export class ProspectResponseComponent implements OnDestroy {
    readonly dialogRef = inject(MatDialogRef<ProspectResponseComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    subscriptions: Array<Subscription> = [];

    constructor(
       private analyticsService: AnalyticsService,
    ) {}

    close(): void {
        this.dialogRef.close();
    }

  /* deleteProspect(prospectId: string) {
    Swal.fire({
      title: "Are you sure of this delete action?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
      
          this.subscriptions.push(
            this.analyticsService.deleteSingle(prospectId).subscribe({
              next: (response) => {
                Swal.fire({
                  position: "bottom",
                  icon: 'success',
                  text: response.message, //`Your have successfully deleted prospect from the system`,
                  showConfirmButton: true,
                  confirmButtonText: "Ok",
                  confirmButtonColor: "#ffab40",
                  timer: 15000,
                }).then((result) => {
                  if (result.isConfirmed) {
                    //this.router.navigateByUrl('dashboard/manage-contacts');
                    location.reload();
                  }
                });
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
  } */

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
    
}
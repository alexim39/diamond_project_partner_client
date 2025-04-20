import { CommonModule } from '@angular/common';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analytics.service';

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

<h2 mat-dialog-title>{{data.surname | titlecase}} {{data.name | titlecase}}'s Response</h2>

<mat-dialog-content>
  
<mat-list>
  
  <mat-list-item>
    <span matListItemTitle>Prospect phone number:</span>
    <span matListItemLine class="bolder">{{data.phoneNumber}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect email address:</span>
    <span matListItemLine class="bolder">{{data.email}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect age range:</span>
    <span matListItemLine class="bolder">{{data.ageRange}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect knew about us through:</span>
    <span matListItemLine class="bolder">{{data.referral}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item *ngIf="data.referralCode">
    <span matListItemTitle>Prospect was referred by:</span>
    <span matListItemLine class="bolder">{{data.referralCode}}</span>
    <small style="color: gray;"><em>Note that {{data.referralCode}} may be a partner in our business</em></small>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect favourite social media platforms:</span>
    <span matListItemLine class="bolder">{{data.socialMedia}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect online purchase frequency:</span>
    <span matListItemLine class="bolder">{{data.onlinePurchaseSchedule}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect motivation for joining online businesses:</span>
    <span matListItemLine class="bolder">{{data.primaryOnlineBusinessMotivation | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect Importance of passive income:</span>
    <span matListItemLine class="bolder">{{data.importanceOfPassiveIncome | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>
  
  <mat-list-item>
    <span matListItemTitle>Prospect employment status:</span>
    <span matListItemLine class="bolder">{{data.employedStatus | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect comfort with technology:</span>
    <span matListItemLine class="bolder">{{data.comfortWithTech}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Business time dedication:</span>
    <span matListItemLine class="bolder">{{data.onlineBusinessTimeDedication}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Prospect Country:</span>
    <span matListItemLine class="bolder">{{data.country}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item >
    <span matListItemTitle>Prospect State of Origin:</span>
    <span matListItemLine class="bolder">{{data.state ? data.state : 'State not found'}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>
  
  <mat-list-item>
    <span matListItemTitle>Date of Visit</span>
    <span matListItemLine class="bolder">{{ data.createdAt | date:'fullDate' }} by {{ data.createdAt | date:'shortTime' }}</span>
  </mat-list-item>

</mat-list>


 <mat-accordion>
  <mat-expansion-panel>
    <mat-expansion-panel-header>
      <mat-panel-title> More Action </mat-panel-title>
      <!-- <mat-panel-description> This is a summary of the content </mat-panel-description> -->
    </mat-expansion-panel-header>
    <p style="color: gray;">Remove prospect from survey list</p>
    <button mat-stroked-button (click)="deleteProspect(data._id)" style="color: red;">
      <mat-icon>delete</mat-icon>
      Delete
    </button>
    
  </mat-expansion-panel>
 </mat-accordion>

 <br><br><br>
</mat-dialog-content>

<mat-dialog-actions>
  <button mat-button (click)="close()">Ok</button>
</mat-dialog-actions>

  `,
    imports: [CommonModule, MatListModule, MatDialogModule, MatIconModule, MatExpansionModule, MatButtonModule, MatDividerModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose]
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

  deleteProspect(prospectId: string) {
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
        /*  Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success"
        }); */

        //const partnerId = this.partner._id;
      
          this.subscriptions.push(
            this.analyticsService.deleteSingle(prospectId).subscribe((res: any) => {
      
              Swal.fire({
                position: "bottom",
                icon: 'success',
                text: `Your have successfully deleted prospect from the system`,
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
      
            }, (error: any) => {
              //console.log(error)
              Swal.fire({
                position: "bottom",
                icon: 'info',
                text: 'Server error occured, please try again',
                showConfirmButton: false,
                timer: 4000
              })
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
import { CommonModule } from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

/**
 * @title Help Dialog
 */
@Component({
  selector: 'async-prospect-response',
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
    <span matListItemTitle>Prospect time willing to dedicate:</span>
    <span matListItemLine class="bolder">{{data.onlineBusinessTimeDedication}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>
  
  <mat-list-item>
    <span matListItemTitle>Date of Visit</span>
    <span matListItemLine class="bolder">{{data.updatedAt | date}}</span>
  </mat-list-item>

</mat-list>

</mat-dialog-content>

<mat-dialog-actions>
<button mat-button (click)="close()">Ok</button>
</mat-dialog-actions>

  `,
  standalone: true,
  imports: [CommonModule, MatListModule, MatDialogModule, MatButtonModule, MatDividerModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class ProspectResponseComponent {
    readonly dialogRef = inject(MatDialogRef<ProspectResponseComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);


    close(): void {
        this.dialogRef.close();
    }
}
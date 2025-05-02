import { CommonModule } from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

/**
 * @title Help Dialog
 */
@Component({
    selector: 'async-link-analytics-dialog',
    styles: `
  .bolder {
    font-weight: bolder;
  }
  `,
    template: `

<h2 mat-dialog-title>{{data.surname | titlecase}} {{data.name | titlecase}}'s Response</h2>

<mat-dialog-content>
  
<mat-list>
  
  <mat-list-item>
    <span matListItemTitle>Contact phone number</span>
    <span matListItemLine class="bolder">{{data.phoneNumber}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Email address</span>
    <span matListItemLine class="bolder">{{data.email}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Are you open to coaching?</span>
    <span matListItemLine class="bolder">{{data.areYouOpenToBeCoached}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Can more skill help you reach your goals?</span>
    <span matListItemLine class="bolder">{{data.doYouBelieveInTraining}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Do you feel like doing more?</span>
    <span matListItemLine class="bolder">{{data.doYouFeelNeedForChange}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>What's your work situation?</span>
    <span matListItemLine class="bolder">{{data.employedStatus | titlecase}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Would you be interested in an online/offline session?</span>
    <span matListItemLine class="bolder">{{data.ifSessionIsSet}}</span>
  </mat-list-item>
<mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Want to make extra money?</span>
    <span matListItemLine class="bolder">{{data.interestedInEarningAdditionaIcome}}</span>
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
    imports: [CommonModule, MatListModule, MatDialogModule, MatButtonModule, MatDividerModule, MatDialogTitle, MatDialogContent, MatDialogActions]
})
export class LinkAnalyticsDialogComponent {
    readonly dialogRef = inject(MatDialogRef<LinkAnalyticsDialogComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);


    close(): void {
        this.dialogRef.close();
    }
}
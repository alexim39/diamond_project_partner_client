import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

/**
 * @title Dialog Animations
*/

@Component({
    selector: 'async-reservation-code',
    imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
  <h3 mat-dialog-title>How to Get Diamond Project Reservation Code</h3>
  <mat-dialog-content>
    <p>
      If you want to get your hands on the Diamond Project Reservation Code, you'll first need to join the Diamond Project as a member. 
      This exclusive code is your ticket to success in our world of entrepreneurship, providing you with business management and resources tracking capabilites to help you thrive in your business.
    </p>

    <p>
    Once you are a member, you will be assigned the reservation code.
    </p>

  </mat-dialog-content>
  <mat-dialog-actions>
    <a mat-button mat-dialog-close cdkFocusInitial>Close</a>
  </mat-dialog-actions>
  `
})
export class ReservationCodeDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ReservationCodeDialogComponent>);
}
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
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  
  template: `
  <h3 mat-dialog-title>How to Get Diamond Project Reservation Code</h3>
  <mat-dialog-content>
    <p>
      If you want to get your hands on the coveted Diamond Project Reservation Code, you'll first need to join the Diamond Project business. 
      This exclusive code is your ticket to success in our world of entrepreneurship, providing you with valuable resources and tools to help you thrive in your business.
    </p>

    <p>
    To join the Diamond Project business, simply sign up as a member and start exploring the various opportunities and benefits that await you. 
    Once you have become a member, you will be assigned the reservation code that will unlock a world of possibilities for your business.
    </p>

    <p>
    With the Diamond Project Reservation Code in hand, you can take your business to new heights and reach your full potential in our compensative market. 
    Don't miss out on this incredible opportunity - join the Diamond Project today and start your journey towards financial success and self development.
    </p>
  </mat-dialog-content>
  <mat-dialog-actions>
    <a mat-flat-button mat-dialog-close color="primary">Join Now</a>
    <a mat-button mat-dialog-close cdkFocusInitial>Close</a>
  </mat-dialog-actions>
  `,
})
export class ReservationCodeDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ReservationCodeDialogComponent>);
}
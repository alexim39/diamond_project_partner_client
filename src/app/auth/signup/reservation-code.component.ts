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
  <h2 mat-dialog-title><span class="eyebrow">Signup help</span>Where do I get a reservation code?</h2>
  <mat-dialog-content>
    <p>
      The reservation code is your ticket into the Diamond Project partner platform. To get one,
      you first join Diamond Project as a member — once you are a member, a reservation code is
      assigned to you.
    </p>
    <p>
      Enter that code on the signup form and your new account is linked to your upline automatically.
      Lost your code? Ask the partner who invited you — they can find it in their dashboard.
    </p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-flat-button color="primary" mat-dialog-close cdkFocusInitial>Got it</button>
  </mat-dialog-actions>
  `,
  styles: [`
    .eyebrow {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dp-gold-ink);
      margin-bottom: 0.25em;
    }
    mat-dialog-content p { line-height: 1.65; }
  `]
})
export class ReservationCodeDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ReservationCodeDialogComponent>);
}
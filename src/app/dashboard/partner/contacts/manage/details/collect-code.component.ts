import { CommonModule } from '@angular/common';
import {Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/**
 * @title Help Dialog
 */
@Component({
  selector: 'async-collect-code-dialog',
  styles: `
  mat-form-field {
    width: 100%;
  }
  `,
  template: `

<h2 mat-dialog-title>{{this.data.prospectSurname}} {{this.data.prospectSurname}} Reservation Code</h2>

<mat-dialog-content>
<p>Please provide reservation code for this partner</p>
  <mat-form-field>
    <mat-label>Enter Reservation Code</mat-label>
    <input matInput />
  </mat-form-field>

</mat-dialog-content>

<mat-dialog-actions>
<button mat-button (click)="close()">Close</button>
<button mat-button (click)="submitCode()">Submit</button>
</mat-dialog-actions>

  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatInputModule, FormsModule, MatFormFieldModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class CollectCodeComponent {
  readonly dialogRef = inject(MatDialogRef<CollectCodeComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }

  submitCode() {
    console.log(this.data)
  }
}
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ApiClient } from '../../../../../../core/http/api-client.service';

interface RecordResponse {
  message: string;
  success: boolean;
}

/**
 * @title Collect Code Dialog — record a prospect's reservation code.
 *
 * Opened per prospect row (dialog data carries the prospect `_id`), so the
 * recorded code links prospect → referrer in one write. Posts to v1 with
 * session identity as the referrer; recording approves the code.
 */
@Component({
    selector: 'async-collect-code-dialog',
    styles: `
  mat-form-field {
    width: 100%;
  }
  `,
    template: `

<h2 mat-dialog-title>{{this.data.prospectName | titlecase}} {{this.data.prospectSurname | titlecase}} Reservation Code</h2>

<mat-dialog-content>
<p>Provide the Diamond Project reservation code issued for this prospect. Recording it approves the code and links it to you as the referrer.</p>
  <mat-form-field appearance="outline">
    <mat-label>Enter Reservation Code</mat-label>
    <input matInput [(ngModel)]="code" placeholder="Eg. NV012652"/>
  </mat-form-field>

</mat-dialog-content>

<mat-dialog-actions>
<button mat-button (click)="close()">Close</button>
<button mat-button (click)="submitCode()" [disabled]="submitting()">{{ submitting() ? 'Saving…' : 'Submit' }}</button>
</mat-dialog-actions>

  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatDialogModule, MatInputModule, FormsModule, MatFormFieldModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions]
})
export class CollectCodeComponent {
  readonly dialogRef = inject(MatDialogRef<CollectCodeComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  private readonly api = inject(ApiClient);
  private readonly destroyRef = inject(DestroyRef);

  code = '';
  readonly submitting = signal(false);

  close(): void {
    this.dialogRef.close();
  }

  submitCode(): void {
    const code = this.code.trim();
    if (!code) {
      Swal.fire({
        position: 'bottom',
        icon: 'info',
        text: 'You should enter the reservation code first',
        showConfirmButton: false,
        timer: 4000
      });
      return;
    }

    const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    this.submitting.set(true);
    this.api
      .post<RecordResponse>('v1/reservations/record', {
        code,
        ...(this.data?._id ? { prospectId: String(this.data._id) } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          Swal.fire({
            position: 'bottom',
            icon: 'success',
            text: res.message || `Reservation code recorded for ${cap(this.data.prospectSurname)} ${cap(this.data.prospectName)}`,
            showConfirmButton: true,
            confirmButtonColor: '#ffab40',
            timer: 15000,
          });
          this.close();
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          const status = error?.status;
          const text = (error?.error as { message?: string } | undefined)?.message
            ?? (status === 409
              ? 'This code is already recorded by another partner'
              : status === 401
                ? 'This code has already been used'
                : 'Server error occurred, please try again');
          Swal.fire({
            position: 'bottom',
            icon: 'info',
            text,
            showConfirmButton: false,
            timer: 4000
          });
        },
      });
  }
}

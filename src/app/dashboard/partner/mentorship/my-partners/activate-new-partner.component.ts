import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ApiClient } from '../../../../core/http/api-client.service';
import { LeadPipelineService } from '../../prospects/lead-pipeline/lead-pipeline.service';
import { ProspectLead } from '../../prospects/lead-pipeline/lead.models';

interface RecordResponse {
  message: string;
  success: boolean;
}

/**
 * @title Activate new partner — record a reservation code.
 *
 * Posts to v1 (session identity IS the referrer, so the code can never
 * be credited to the wrong upline) and optionally links the prospect the
 * code was issued for. Recording approves the code — ready to use.
 */
@Component({
    selector: 'async-activate-new-partner-dialog',
    styles: `
  mat-form-field {
    width: 100%;
  }
  `,
    template: `

<h2 mat-dialog-title>{{ displayName() }} Reservation Code</h2>

<mat-dialog-content>
<p>Provide the Diamond Project reservation code issued for this partner. Recording it approves the code and links it to you as the referrer.</p>
  <mat-form-field appearance="outline">
    <mat-label>Enter Reservation Code</mat-label>
    <input matInput [(ngModel)]="code" placeholder="Eg. NV012652"/>
  </mat-form-field>
  <mat-form-field appearance="outline">
    <mat-label>Prospect (optional)</mat-label>
    <mat-select [(ngModel)]="prospectId">
      <mat-option [value]="null">No specific prospect</mat-option>
      @for (p of prospects(); track p.id) {
        <mat-option [value]="p.id">{{ prospectName(p) }}</mat-option>
      }
    </mat-select>
  </mat-form-field>

</mat-dialog-content>

<mat-dialog-actions>
    <button mat-button (click)="close()">Close</button>
    <button mat-raised-button (click)="submitCode()" [disabled]="submitting()">{{ submitting() ? 'Saving…' : 'Submit' }}</button>
</mat-dialog-actions>

  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatDialogModule, MatInputModule, MatSelectModule, FormsModule, MatFormFieldModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions]
})
export class ActivateNewPartnerComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ActivateNewPartnerComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  private readonly api = inject(ApiClient);
  private readonly leads = inject(LeadPipelineService);
  private readonly destroyRef = inject(DestroyRef);

  code = '';
  prospectId: string | null = null;
  readonly prospects = signal<ProspectLead[]>([]);
  readonly submitting = signal(false);

  displayName(): string {
    const d = this.data ?? {};
    const full = `${d.prospectName ?? d.name ?? ''} ${d.prospectSurname ?? d.surname ?? ''}`.trim();
    return full || 'New Partner';
  }

  prospectName(p: ProspectLead): string {
    return `${p.prospectName ?? ''} ${p.prospectSurname ?? ''}`.trim() || 'Unnamed';
  }

  ngOnInit(): void {
    const selfId = this.data?._id;
    if (!selfId) return;
    this.leads
      .listByPartner(String(selfId), 200)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.prospects.set(res.data ?? []),
        error: () => this.prospects.set([]),
      });
  }

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

    this.submitting.set(true);
    this.api
      .post<RecordResponse>('v1/reservations/record', {
        code,
        ...(this.prospectId ? { prospectId: this.prospectId } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          Swal.fire({
            position: 'bottom',
            icon: 'success',
            text: res.message || 'Reservation code recorded and approved',
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

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ManagedPartner } from '../../../core/admin/admin.models';
import { APP_PERMISSIONS } from '../../../core/auth/permissions';

@Component({
  selector: 'async-feature-access-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>Feature access</h2>

    <mat-dialog-content class="body">
      <p class="member">{{ name }}</p>
      <p class="muted">
        Grant read-only access without changing this member's role or giving them the
        Admin console.
      </p>

      <label class="feature">
        <mat-slide-toggle [checked]="prolificLeads()" (change)="prolificLeads.set($event.checked)">
          Prolific Women leads
        </mat-slide-toggle>
        <span class="muted">
          View website applications and accept a lead into their own pipeline.
        </span>
      </label>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()">Save access</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .body { display: flex; flex-direction: column; gap: 0.8em; min-width: min(460px, 85vw); }
    .member { margin: 0; font-weight: 700; }
    .muted { color: var(--dp-muted); font-size: 0.85em; margin: 0; }
    .feature { display: flex; flex-direction: column; gap: 0.35em; padding: 0.9em; border: 1px solid var(--dp-line); border-radius: 10px; background: var(--dp-paper); }
    button { min-height: 44px; }
  `],
})
export class FeatureAccessDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<FeatureAccessDialogComponent>);
  private readonly data = inject<{ partner: ManagedPartner }>(MAT_DIALOG_DATA);

  protected readonly prolificLeads = signal(
    (this.data.partner.permissions ?? []).includes(
      APP_PERMISSIONS.PROLIFIC_WOMAN_LEADS_VIEW,
    ),
  );

  protected get name(): string {
    const partner = this.data.partner;
    return `${partner.name ?? ''} ${partner.surname ?? ''}`.trim() || partner.username;
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected save(): void {
    this.dialogRef.close(
      this.prolificLeads() ? [APP_PERMISSIONS.PROLIFIC_WOMAN_LEADS_VIEW] : [],
    );
  }
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { BonusCampaign, BonusService } from '../../../core/bonuses/bonus.service';
import { ApiError } from '../../../core/http/api-error';

type CampaignRow = BonusCampaign & { claims: number; createdAt?: string };

/**
 * @title Bonus campaigns — admin desk.
 *
 * Configurable wallet bonuses: create, enable/disable, edit. Members
 * claim once per campaign from the dashboard banner; credits land via
 * the shared wallet core and are audited. OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-admin-bonuses',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatInputModule, MatProgressBarModule, MatTableModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Admin</span> &gt;
        <span>Bonuses</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Bonus campaigns</h2>
          <p class="subtitle">Welcome bonuses members claim into their wallets — one claim per member per campaign.</p>
        </div>
        <button mat-button (click)="showForm.set(!showForm())">{{ showForm() ? 'Cancel' : 'New campaign' }}</button>
      </div>

      @if (showForm()) {
        <form class="dp-card bonus-form" [formGroup]="form" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" maxlength="120" placeholder="e.g. Welcome bonus" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Banner message</mat-label>
            <input matInput formControlName="message" maxlength="500" placeholder="What members see on the banner" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Amount (₦)</mat-label>
            <input matInput type="number" min="1" max="1000000" formControlName="amountNgn" />
          </mat-form-field>
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving…' : 'Create campaign' }}
            </button>
            @if (formError(); as err) {
              <span class="error" role="alert">{{ err }}</span>
            }
          </div>
        </form>
      }

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
      }

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Campaign</th>
              <td mat-cell *matCellDef="let row">
                <strong>{{ row.title }}</strong>
                <div class="muted">{{ row.message || '—' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let row">₦{{ row.amountNgn | number }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="dp-status {{ row.status === 'active' ? 'dp-status--ok' : 'dp-status--neutral' }}">{{ row.status }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="claims">
              <th mat-header-cell *matHeaderCellDef>Claims</th>
              <td mat-cell *matCellDef="let row">{{ row.claims | number }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (editingId() === row.id) {
                  <span class="edit-row">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="edit-amount">
                      <mat-label>Amount (₦)</mat-label>
                      <input matInput type="number" min="1" max="1000000" [(ngModel)]="editAmount" />
                    </mat-form-field>
                    <button mat-flat-button color="primary" (click)="saveEdit(row)" [disabled]="actingId() === row.id">Save</button>
                    <button mat-button (click)="cancelEdit()" [disabled]="actingId() === row.id">Cancel</button>
                  </span>
                } @else {
                  <button mat-button (click)="startEdit(row)" [disabled]="actingId() === row.id">Edit</button>
                  <button mat-button (click)="toggle(row)" [disabled]="actingId() === row.id">
                    {{ row.status === 'active' ? 'Disable' : 'Enable' }}
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No campaigns yet — create the first one above.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .queue-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 52em; }
    .bonus-form { padding: 1em; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75em; }
    .form-actions { display: flex; align-items: center; gap: 0.75em; grid-column: 1 / -1; flex-wrap: wrap; }
    .form-actions button { min-height: 44px; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .edit-row { display: inline-flex; align-items: center; gap: 0.4em; flex-wrap: wrap; }
    .edit-row button { min-height: 44px; }
    .edit-amount { width: 140px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); }
    .notice { color: var(--dp-success); }
    .empty { color: var(--dp-muted); }
  `],
})
export class AdminBonusesComponent implements OnInit {
  private readonly bonuses = inject(BonusService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly actingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly showForm = signal(false);
  protected readonly rows = signal<CampaignRow[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected editAmount = 0;

  protected readonly displayedColumns = ['title', 'amount', 'status', 'claims', 'action'];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    message: ['', Validators.maxLength(500)],
    amountNgn: [2500, [Validators.required, Validators.min(1), Validators.max(1000000)]],
  });

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.bonuses
      .campaigns()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: { data?: { items?: CampaignRow[] } }) => {
          this.rows.set(res.data?.items ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.formError.set(null);
    this.notice.set(null);
    const v = this.form.getRawValue();
    this.bonuses
      .createCampaign({ title: v.title.trim(), message: v.message.trim(), amountNgn: Number(v.amountNgn) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showForm.set(false);
          this.form.reset({ title: '', message: '', amountNgn: 2500 });
          this.notice.set('Campaign created and live for eligible members.');
          this.reload();
        },
        error: (err: ApiError) => {
          this.saving.set(false);
          this.formError.set(err.message);
        },
      });
  }

  protected startEdit(row: CampaignRow): void {
    this.editingId.set(row.id);
    this.editAmount = row.amountNgn;
    this.notice.set(null);
    this.error.set(null);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  /** Save an amount change — takes effect for future claims immediately. */
  protected saveEdit(row: CampaignRow): void {
    const amount = Math.floor(Number(this.editAmount));
    if (!Number.isInteger(amount) || amount < 1 || amount > 1000000) {
      this.error.set('Amount must be a whole naira value between 1 and 1,000,000.');
      return;
    }
    if (amount === row.amountNgn) {
      this.editingId.set(null);
      return;
    }
    if (this.actingId()) return;
    this.actingId.set(row.id);
    this.notice.set(null);
    this.error.set(null);
    this.bonuses
      .updateCampaign(row.id, { amountNgn: amount })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.editingId.set(null);
          this.notice.set(`Amount updated to ₦${amount.toLocaleString()} — new claims pay the new amount.`);
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected toggle(row: CampaignRow): void {
    if (this.actingId()) return;
    this.actingId.set(row.id);
    this.notice.set(null);
    this.error.set(null);
    this.bonuses
      .updateCampaign(row.id, { status: row.status === 'active' ? 'disabled' : 'active' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.notice.set(row.status === 'active' ? 'Campaign disabled — banners hidden.' : 'Campaign enabled.');
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }
}

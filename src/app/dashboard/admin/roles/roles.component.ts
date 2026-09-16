import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/admin/admin.service';
import { ManagedPartner, PlatformStats } from '../../../core/admin/admin.models';
import { ApiError } from '../../../core/http/api-error';
import { UserRole } from '../../../core/auth/auth.models';

const ROLE_META: Record<UserRole, { label: string; color: string; text: string }> = {
  user: { label: 'Partner', color: '#e0e0e0', text: '#424242' },
  leader: { label: 'Leader', color: '#bbdefb', text: '#0d47a1' },
  g8: { label: 'G8 Leader', color: '#e1bee7', text: '#4a148c' },
  admin: { label: 'Admin', color: '#ffccbc', text: '#bf360c' },
};

/**
 * @title Manage roles — admin console.
 *
 * Server is authoritative: every action hits `/v1/admin/*` (requireRole
 * enforced in the API). Self-edits are rejected with 403, last-admin
 * demotion with 409 — both surfaced inline from the `ApiError` envelope.
 */
@Component({
  selector: 'async-manage-roles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, MatTableModule, MatChipsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressBarModule, MatTooltipModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Manage Roles</span>
      </div>
    </section>

    <section class="roles-page">
      <div class="page-head">
        <div>
          <h2>Manage Roles</h2>
          <p class="subtitle">Promote partners to leaders, grant or revoke admin access.</p>
        </div>
      </div>

      <div class="toolbar">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Search partners</mat-label>
          <input matInput type="search" placeholder="Name, username or email" (input)="onSearch($event)" />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        @if (loading()) {
          <mat-progress-bar mode="indeterminate" class="loader" />
        }
      </div>

      @if (stats(); as s) {
        <div class="stat-grid" role="group" aria-label="Platform totals">
          <div class="dp-card stat"><span class="stat-value">{{ s.total | number }}</span><span class="muted">Partners</span></div>
          <div class="dp-card stat"><span class="stat-value">+{{ s.new7d | number }}</span><span class="muted">New 7d</span></div>
          <div class="dp-card stat"><span class="stat-value">+{{ s.new30d | number }}</span><span class="muted">New 30d</span></div>
          <div class="dp-card stat"><span class="stat-value">{{ s.roles.admin | number }}</span><span class="muted">Admins</span></div>
          <div class="dp-card stat"><span class="stat-value">{{ s.roles.leader | number }}</span><span class="muted">Leaders</span></div>
          <div class="dp-card stat"><span class="stat-value">{{ s.roles.g8 | number }}</span><span class="muted">G8</span></div>
          <div class="dp-card stat"><span class="stat-value">{{ s.suspended | number }}</span><span class="muted">Suspended</span></div>
        </div>
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Partner</th>
              <td mat-cell *matCellDef="let row" class="name-cell">{{ displayName(row) }}</td>
            </ng-container>
            <ng-container matColumnDef="contact">
              <th mat-header-cell *matHeaderCellDef>Contact</th>
              <td mat-cell *matCellDef="let row">
                <div>{{ row.email }}</div>
                <div class="muted">{{ row.phone || '—' }}</div>
              </td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let row">
                <span [class]="roleClass(row.role)">
                  {{ meta(row.role).label }}
                </span>
                @if (row.suspended) {
                  <span class="dp-status dp-status--bad" [matTooltip]="row.suspendReason || 'Suspended'">Suspended</span>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="plan">
              <th mat-header-cell *matHeaderCellDef>Plan</th>
              <td mat-cell *matCellDef="let row">{{ row.subscription?.plan ?? '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                @if (confirmId() === row.id) {
                  <button
                    mat-flat-button
                    color="primary"
                    (click)="applyRole(row, pendingRole())"
                    [disabled]="actingId() === row.id"
                  >Confirm {{ pendingRole() }}?</button>
                  <button mat-button (click)="confirmId.set(null)">Cancel</button>
                } @else if (suspendId() === row.id) {
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Reason (optional)</mat-label>
                    <input matInput [value]="suspendReason()" (input)="suspendReason.set($any($event.target).value)" maxlength="500" />
                  </mat-form-field>
                  <button
                    mat-flat-button
                    color="warn"
                    (click)="applySuspend(row, true)"
                    [disabled]="actingId() === row.id"
                  >Confirm suspend?</button>
                  <button mat-button (click)="suspendId.set(null)">Cancel</button>
                } @else {
                  @for (target of transitions(row.role); track target) {
                    <button
                      mat-button
                      [matTooltip]="'Change role to ' + target"
                      (click)="arm(row.id, target)"
                    >Make {{ target }}</button>
                  }
                  @if (row.suspended) {
                    <button mat-button (click)="applySuspend(row, false)" [disabled]="actingId() === row.id">Reactivate</button>
                  } @else {
                    <button mat-button color="warn" (click)="suspendId.set(row.id); suspendReason.set('')">Suspend</button>
                  }
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <div class="pager">
          <button mat-button (click)="page(-1)" [disabled]="skip() === 0 || loading()">Previous</button>
          <span class="muted">{{ total() }} partners</span>
          <button mat-button (click)="page(1)" [disabled]="skip() + limit() >= total() || loading()">Next</button>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No partners found.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .roles-page { display: flex; flex-direction: column; gap: 1.25em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .toolbar { display: flex; align-items: center; gap: 1em; flex-wrap: wrap; }
    .toolbar mat-form-field { flex: 1; min-width: 220px; }
    .loader { flex: 2; min-width: 120px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.6em; }
    .stat { display: flex; flex-direction: column; gap: 0.1em; padding: 0.7em 0.9em; }
    .stat-value { font-size: 1.4em; font-weight: 700; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; text-transform: capitalize; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: #d32f2f; display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    .pager { display: flex; align-items: center; gap: 1em; }
  `],
})
export class ManageRolesComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<ManagedPartner[]>([]);
  protected readonly total = signal(0);
  protected readonly stats = signal<PlatformStats | null>(null);
  protected readonly limit = signal(25);
  protected readonly skip = signal(0);
  protected readonly query = signal('');
  protected readonly actingId = signal<string | null>(null);
  protected readonly confirmId = signal<string | null>(null);
  protected readonly pendingRole = signal<UserRole>('leader');
  protected readonly suspendId = signal<string | null>(null);
  protected readonly suspendReason = signal('');

  protected readonly displayedColumns = ['name', 'contact', 'role', 'plan', 'action'];

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.reload();
    this.admin
      .stats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this.stats.set(res.data ?? null),
        error: () => this.stats.set(null),
      });
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.query.set(value.trim());
      this.skip.set(0);
      this.reload();
    }, 300);
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.admin
      .directory({ q: this.query(), limit: this.limit(), skip: this.skip() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.total.set(res.total ?? 0);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected page(direction: 1 | -1): void {
    this.skip.set(Math.max(0, this.skip() + direction * this.limit()));
    this.reload();
  }

  protected meta(role: UserRole): { label: string; color: string; text: string } {
    return ROLE_META[role] ?? ROLE_META.user;
  }

  /** Plain-span role pill — mat-chip repaints internals from theme tokens. */
  protected roleClass(role: UserRole): string {
    if (role === 'g8') return 'dp-status dp-status--purple';
    if (role === 'leader') return 'dp-status dp-status--info';
    if (role === 'admin') return 'dp-status dp-status--warn';
    return 'dp-status dp-status--neutral';
  }

  protected displayName(row: ManagedPartner): string {
    return `${row.name ?? ''} ${row.surname ?? ''}`.trim() || row.username;
  }

  /** Valid transitions from a role (same-role excluded; G8 is admin-bestowed). */
  protected transitions(role: UserRole): UserRole[] {
    return (['user', 'leader', 'g8', 'admin'] as UserRole[]).filter((r) => r !== role);
  }

  protected arm(partnerId: string, role: UserRole): void {
    this.confirmId.set(partnerId);
    this.suspendId.set(null);
    this.pendingRole.set(role);
  }

  protected applyRole(row: ManagedPartner, role: UserRole): void {
    this.actingId.set(row.id);
    this.admin
      .setRole(row.id, role)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actingId.set(null);
          this.confirmId.set(null);
          this.rows.set(this.rows().map((r) => (r.id === row.id ? res.data : r)));
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.confirmId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected applySuspend(row: ManagedPartner, suspended: boolean): void {
    this.actingId.set(row.id);
    this.admin
      .setSuspended(row.id, suspended, this.suspendReason())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actingId.set(null);
          this.suspendId.set(null);
          this.suspendReason.set('');
          this.rows.set(this.rows().map((r) => (r.id === row.id ? res.data : r)));
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.suspendId.set(null);
          this.error.set(err.message);
        },
      });
  }
}

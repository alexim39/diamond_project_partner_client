import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { AdminProductsService, AdminProduct } from './admin-products.service';
import { ApiError } from '../../../core/http/api-error';

/**
 * @title Products — admin catalog editor.
 *
 * Create + edit name/price/description/image over the admin-guarded
 * endpoints (the legacy unguarded PUT stays untouched). No delete:
 * carts reference products, so removal would orphan order history.
 * OnPush + signals.
 */
@Component({
  selector: 'async-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatTableModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Admin</a> &gt;
        <span>Products</span>
      </div>
    </section>

    <section class="queue-page">
      <div class="page-head">
        <div>
          <h2>Products</h2>
          <p class="subtitle">Catalog entries sold through checkout — commissions accrue from these prices.</p>
        </div>
      </div>

      @if (notice(); as note) {
        <p class="notice" role="status">{{ note }}</p>
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

      <div class="dp-card edit-card">
        <h3>{{ editingId() ? 'Edit product' : 'New product' }}</h3>
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput [value]="form().name" (input)="setField('name', $any($event.target).value)" maxlength="200" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Price (₦)</mat-label>
          <input matInput type="number" [value]="form().price ?? ''" (input)="setPrice($any($event.target).valueAsNumber)" min="0" step="0.01" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput rows="2" [value]="form().desc" (input)="setField('desc', $any($event.target).value)" maxlength="2000"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Image URL</mat-label>
          <input matInput [value]="form().img" (input)="setField('img', $any($event.target).value)" maxlength="500" />
        </mat-form-field>
        <div class="edit-actions">
          <span class="spacer"></span>
          @if (editingId()) {
            <button mat-button (click)="cancelEdit()">Cancel</button>
          }
          <button mat-flat-button color="primary" (click)="save()" [disabled]="saving() || !valid()">{{ saving() ? 'Saving…' : editingId() ? 'Save changes' : 'Create product' }}</button>
        </div>
        @if (saveError(); as err) {
          <p class="error" role="alert">{{ err }}</p>
        }
      </div>

      @if (rows().length > 0) {
        <div class="table-wrap">
          <table mat-table [dataSource]="rows()" class="mat-elevation-z2">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let row"><strong>{{ row.name ?? '—' }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let row">₦{{ row.price | number:'1.0-2' }}</td>
            </ng-container>
            <ng-container matColumnDef="action">
              <th mat-header-cell *matHeaderCellDef>Action</th>
              <td mat-cell *matCellDef="let row">
                <button mat-button (click)="startEdit(row)">Edit</button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      } @else if (!loading() && !error()) {
        <p class="empty">No products yet.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .queue-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .notice { color: var(--dp-success); }
    .edit-card { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; max-width: 560px; }
    .edit-card h3 { margin: 0; }
    .edit-actions { display: flex; align-items: center; gap: 0.5em; }
    .edit-actions .spacer { flex: 1; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .empty { color: var(--dp-muted); }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    button { min-height: 44px; }
  `],
})
export class AdminProductsComponent implements OnInit {
  private readonly products = inject(AdminProductsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly rows = signal<AdminProduct[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected readonly form = signal({ name: '', price: null as number | null, desc: '', img: '' });

  protected readonly displayedColumns = ['name', 'price', 'action'];

  ngOnInit(): void {
    this.reload();
  }

  protected valid(): boolean {
    const f = this.form();
    return f.name.trim().length > 0 && f.price !== null && Number.isFinite(f.price) && f.price >= 0;
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.products
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.rows.set(res.data ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected setField(field: 'name' | 'desc' | 'img', value: string): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  protected setPrice(value: number): void {
    this.form.update((f) => ({ ...f, price: Number.isFinite(value) ? value : null }));
  }

  protected startEdit(row: AdminProduct): void {
    this.editingId.set(String(row._id ?? row.id ?? ''));
    this.form.set({
      name: row.name ?? '',
      price: typeof row.price === 'number' ? row.price : null,
      desc: row.desc ?? '',
      img: row.img ?? '',
    });
    this.saveError.set(null);
    this.notice.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.form.set({ name: '', price: null, desc: '', img: '' });
    this.saveError.set(null);
  }

  protected save(): void {
    if (!this.valid() || this.saving()) return;
    this.saving.set(true);
    this.saveError.set(null);
    this.notice.set(null);
    const id = this.editingId();
    const req = id
      ? this.products.update(id, { ...this.form() })
      : this.products.create({ ...this.form(), price: this.form().price as number });
    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.notice.set(id ? 'Product updated.' : 'Product created.');
        this.cancelEdit();
        this.reload();
        void res;
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        this.saveError.set(err.message);
      },
    });
  }
}

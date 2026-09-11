import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { ProgressionService } from '../../../core/progression/progression.service';
import { LADDER, Oversight, PendingNomination } from '../../../core/progression/progression.models';
import { ApiError } from '../../../core/http/api-error';

/**
 * @title Oversight — organization leadership at a glance.
 *
 * Level distribution across the downline plus the pending G-nomination
 * inbox with approve/reject. Gated to ladder-g8 + admins (g8Guard).
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-oversight',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, DecimalPipe, MatButtonModule, MatCardModule,
    MatIconModule, MatProgressBarModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <span>Oversight</span>
      </div>
    </section>

    <section class="oversight-page">
      <div class="page-head">
        <div>
          <h2>Oversight</h2>
          <p class="subtitle">Who is where on the ladder — and who awaits your decision.</p>
        </div>
        <a mat-button routerLink="/dashboard/network/tree">Network tree</a>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (oversight(); as o) {
        <div class="stat-grid">
          <mat-card>
            <mat-card-content>
              <mat-icon>groups</mat-icon>
              <span class="stat-value">{{ o.total | number }}</span>
              <span class="stat-label">Downline members @if (o.capped) { (capped at 2,000) }</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>military_tech</mat-icon>
              <span class="stat-value">{{ o.leaders | number }}</span>
              <span class="stat-label">Leaders (ECL and above)</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>how_to_reg</mat-icon>
              <span class="stat-value">{{ o.pendingCount | number }}</span>
              <span class="stat-label">Nominations awaiting decision</span>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="dp-card levels-card">
          <h3>Level distribution</h3>
          @for (rung of ladderBars(); track rung.level) {
            <div class="bar-row">
              <span class="bar-label">{{ rung.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="rung.width"></div>
              </div>
              <span class="bar-num">{{ rung.count | number }}</span>
            </div>
          }
        </div>

        <h3>Nominations ({{ o.pendingNominations.length }})</h3>
        @if (o.pendingNominations.length > 0) {
          <ul class="nom-list">
            @for (nom of o.pendingNominations; track nom.partnerId) {
              <li class="dp-card nom-card">
                <div class="nom-top">
                  <div>
                    <strong>{{ nom.member?.name ?? 'Teammate' }}</strong>
                    <span class="muted">@{{ nom.member?.username ?? '—' }} · {{ levelLabel(nom.level) }}</span>
                  </div>
                  <span class="muted">{{ nom.requestedAt | date:'mediumDate' }}</span>
                </div>
                @if (nom.note) {
                  <p class="nom-note">"{{ nom.note }}"</p>
                }
                <div class="nom-actions">
                  <button mat-flat-button color="primary" (click)="decide(nom, true)" [disabled]="actingId() === nom.partnerId">Approve</button>
                  <button mat-button color="warn" (click)="decide(nom, false)" [disabled]="actingId() === nom.partnerId">Reject</button>
                </div>
              </li>
            }
          </ul>
        } @else if (!loading()) {
          <p class="empty">No nominations waiting — the inbox is clear.</p>
        }
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .oversight-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .oversight-page h3 { margin: 0.5em 0 0; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.75em; }
    .stat-grid mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .stat-grid mat-icon { color: var(--dp-gold); }
    .stat-value { font-size: 1.5em; font-weight: 700; }
    .stat-label { color: var(--dp-muted); font-size: 0.85em; }
    .levels-card { padding: 1em; display: flex; flex-direction: column; gap: 0.5em; }
    .levels-card h3 { margin: 0 0 0.25em; font-size: 1em; }
    .bar-row { display: grid; grid-template-columns: 170px 1fr 56px; gap: 0.6em; align-items: center; }
    .bar-label { font-size: 0.85em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-track { height: 14px; background: var(--dp-paper); border: 1px solid var(--dp-line); border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: var(--dp-gold); min-width: 2px; }
    .bar-num { text-align: right; font-weight: 600; font-size: 0.9em; }
    .nom-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .nom-card { padding: 0.9em 1em; display: flex; flex-direction: column; gap: 0.5em; }
    .nom-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75em; flex-wrap: wrap; }
    .nom-note { margin: 0; font-style: italic; }
    .nom-actions { display: flex; gap: 0.4em; flex-wrap: wrap; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    @media only screen and (max-width: 600px) {
      .bar-row { grid-template-columns: 110px 1fr 44px; }
    }
  `],
})
export class OversightComponent implements OnInit {
  private readonly progress = inject(ProgressionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly actingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly oversight = signal<Oversight | null>(null);

  protected readonly ladderBars = computed(() => {
    const dist = this.oversight()?.distribution ?? {};
    const max = Math.max(1, ...LADDER.map((r) => dist[r.level] ?? 0));
    return LADDER.map((r) => ({
      level: r.level,
      label: r.label,
      count: dist[r.level] ?? 0,
      width: Math.max(dist[r.level] ? 2 : 0, Math.round(((dist[r.level] ?? 0) / max) * 100)),
    }));
  });

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.progress
      .oversight()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.oversight.set(res.data ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected levelLabel(level: string | null): string {
    return LADDER.find((r) => r.level === level)?.label ?? 'Unknown';
  }

  protected decide(nom: PendingNomination, approved: boolean): void {
    this.actingId.set(nom.partnerId);
    this.progress
      .decideNomination(nom.partnerId, approved)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actingId.set(null);
          this.reload();
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { MarketingService } from '../../../core/marketing/marketing.service';

/**
 * @title Marketing home — one roof for promote + measure + referrals.
 * Links the fractured tools (campaigns manage/new, ROI, invite) in one
 * place and shows the tracked referral card (link + recruits + recent).
 */
@Component({
  selector: 'async-marketing-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, RouterModule],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb"><a routerLink="/dashboard">Dashboard</a> &gt; <span>Marketing</span></div>
    </section>
    <section class="page">
      <div class="page-head"><div><h2>Marketing</h2><p class="subtitle">Promote, measure, and grow referrals from one place.</p></div></div>
      <div class="grid">
        <mat-card class="dp-card"><mat-card-content>
          <mat-icon>campaign</mat-icon><h3>Campaigns</h3>
          <p class="muted">Run invite campaigns and track spend.</p>
          <div class="row"><a mat-button routerLink="/dashboard/tools/campaigns/manage">My campaigns</a><a mat-flat-button color="primary" routerLink="/dashboard/tools/campaigns/new">New</a></div>
        </mat-card-content></mat-card>
        <mat-card class="dp-card"><mat-card-content>
          <mat-icon>insights</mat-icon><h3>ROI</h3><p class="muted">Spend in, recruits out.</p>
          <div class="row"><a mat-button routerLink="/dashboard/marketing/roi">Open ROI</a></div>
        </mat-card-content></mat-card>
        <mat-card class="dp-card"><mat-card-content>
          <mat-icon>share</mat-icon><h3>Invite</h3><p class="muted">Share your personal link.</p>
          <div class="row"><a mat-button routerLink="/dashboard/tools/campaigns/share">Share link</a></div>
        </mat-card-content></mat-card>
      </div>
      <div class="dp-card ref-card">
        <h3>Referrals</h3>
        @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
        @if (data(); as r) {
          <p class="link">{{ r.link ?? '—' }}</p>
          <p><strong>{{ r.recruits | number }}</strong> direct recruits</p>
          @if (r.recent.length > 0) {
            <div class="muted">Latest: @for (m of r.recent; track m.id; let last = $last) { {{ m.name }}{{ last ? '' : ', ' }} }</div>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; } .breadcrumb a { text-decoration: none; }
    .page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head h2 { margin: 0; } .subtitle { color: var(--dp-muted); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75em; }
    .dp-card mat-card-content { display: flex; flex-direction: column; gap: 0.5em; }
    .row { display: flex; gap: 0.5em; flex-wrap: wrap; } .muted { color: var(--dp-muted); font-size: 0.85em; }
    .ref-card { padding: 1em; } .ref-card h3 { margin: 0; } .link { font-weight: 600; word-break: break-all; }
    button, a[mat-button], a[mat-flat-button] { min-height: 44px; }
  `],
})
export class MarketingHomeComponent implements OnInit {
  private readonly marketing = inject(MarketingService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly loading = signal(true);
  protected readonly data = signal<{ link: string | null; recruits: number; recent: Array<{ id: string; name: string }> } | null>(null);
  ngOnInit(): void {
    this.marketing.referrals().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => { this.data.set(res.data ?? null); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}

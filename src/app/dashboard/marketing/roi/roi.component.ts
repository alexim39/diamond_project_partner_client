import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { NgxEchartsDirective } from 'ngx-echarts';
import { MarketingService } from '../../../core/marketing/marketing.service';
import { CampaignRoi, RoiTotals } from '../../../core/marketing/marketing.models';
import { ChartThemeService } from '../../../core/charts/chart-theme.service';
import type { EChartsCoreOption } from '../../../core/charts/echarts-setup';
import { ApiError } from '../../../core/http/api-error';

/**
 * @title Campaign ROI — what each campaign earned back.
 *
 * Spend vs attributed recruits per campaign, with honest badges:
 * `exact` rows were stamped at creation, `estimated` rows fall back to
 * the flight-window heuristic. OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-campaign-roi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe, MatButtonModule, MatCardModule, MatIconModule,
    MatProgressBarModule, MatSelectModule, MatTableModule,
    NgxEchartsDirective, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Grow</a> &gt;
        <span>Campaign ROI</span>
      </div>
    </section>

    <section class="roi-page">
      <div class="page-head">
        <div>
          <h2>Campaign ROI</h2>
          <p class="subtitle">Spend in, recruits out — per campaign.</p>
        </div>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="days-field">
          <mat-label>Window</mat-label>
          <mat-select [value]="days()" (selectionChange)="days.set($event.value); reload()">
            @for (d of dayOptions; track d) {
              <mat-option [value]="d">Last {{ d }} days</mat-option>
            }
          </mat-select>
        </mat-form-field>
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

      @if (totals(); as t) {
        <div class="stat-grid">
          <mat-card>
            <mat-card-content>
              <mat-icon>ads_click</mat-icon>
              <span class="stat-value">{{ t.visits | number }}</span>
              <span class="stat-label">Link visits</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>payments</mat-icon>
              <span class="stat-value">{{ t.budget | number }}</span>
              <span class="stat-label">Spend</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>person_add</mat-icon>
              <span class="stat-value">{{ t.prospects | number }}</span>
              <span class="stat-label">Attributed recruits</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>celebration</mat-icon>
              <span class="stat-value">{{ t.conversions | number }}</span>
              <span class="stat-label">Converted @if (t.conversionRate !== null) { ({{ t.conversionRate }}%) }</span>
            </mat-card-content>
          </mat-card>
          <mat-card>
            <mat-card-content>
              <mat-icon>receipt_long</mat-icon>
              <span class="stat-value">@if (t.costPerConversion !== null) { {{ t.costPerConversion | number }} } @else { — }</span>
              <span class="stat-label">Cost per conversion</span>
            </mat-card-content>
          </mat-card>
        </div>
      }

      @if (costChart(); as chart) {
        <div class="dp-card trends">
          <h3>Cost per conversion by campaign</h3>
          <div echarts [options]="chart" class="chart" role="img" aria-label="Cost per conversion chart"></div>
        </div>
      }

      @if (campaigns().length > 0) {
        <h3>Campaigns</h3>
        <div class="table-wrap">
          <table mat-table [dataSource]="campaigns()" class="mat-elevation-z2">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Campaign</th>
              <td mat-cell *matCellDef="let c" class="name-cell">
                {{ c.name }}
                <span class="dp-status" [class.dp-status--ok]="c.attribution === 'exact'" [class.dp-status--warn]="c.attribution !== 'exact'">
                  {{ c.attribution === 'exact' ? 'exact' : 'estimated' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="visits">
              <th mat-header-cell *matHeaderCellDef>Visits</th>
              <td mat-cell *matCellDef="let c" class="num-cell">{{ c.visits | number }}</td>
            </ng-container>
            <ng-container matColumnDef="budget">
              <th mat-header-cell *matHeaderCellDef>Spend</th>
              <td mat-cell *matCellDef="let c" class="num-cell">{{ c.budget | number }}</td>
            </ng-container>
            <ng-container matColumnDef="prospects">
              <th mat-header-cell *matHeaderCellDef>Recruits</th>
              <td mat-cell *matCellDef="let c" class="num-cell">{{ c.windowProspects | number }}</td>
            </ng-container>
            <ng-container matColumnDef="conversions">
              <th mat-header-cell *matHeaderCellDef>Converted</th>
              <td mat-cell *matCellDef="let c" class="num-cell">{{ c.windowConversions | number }}</td>
            </ng-container>
            <ng-container matColumnDef="cpp">
              <th mat-header-cell *matHeaderCellDef>Cost/recruit</th>
              <td mat-cell *matCellDef="let c" class="num-cell">{{ c.costPerProspect === null ? '—' : (c.costPerProspect | number) }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <p class="muted">Estimated rows count link-tagged recruits created while the campaign flew. Stamp a campaign on creation for exact numbers.</p>
      } @else if (!loading() && !error()) {
        <p class="empty">No campaigns yet — start one, then come back for the numbers.</p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .roi-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .roi-page h3 { margin: 0.5em 0 0; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .days-field { width: 170px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75em; }
    .stat-grid mat-card-content { display: flex; flex-direction: column; gap: 0.2em; }
    .stat-grid mat-icon { color: var(--dp-gold); }
    .stat-value { font-size: 1.5em; font-weight: 700; }
    .stat-label { color: var(--dp-muted); font-size: 0.85em; }
    .trends { padding: 1em; }
    .trends h3 { margin: 0 0 0.75em; font-size: 1em; }
    .chart { height: 260px; width: 100%; }
    .table-wrap { overflow-x: auto; border-radius: 8px; }
    table { width: 100%; }
    .name-cell { font-weight: 600; }
    .name-cell .dp-status { margin-left: 0.5em; }
    .num-cell { text-align: right; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class CampaignRoiComponent implements OnInit {
  private readonly marketing = inject(MarketingService);
  private readonly charts = inject(ChartThemeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly days = signal(30);
  protected readonly campaigns = signal<CampaignRoi[]>([]);
  protected readonly totals = signal<RoiTotals | null>(null);

  protected readonly dayOptions = [7, 30, 90];
  protected readonly displayedColumns = ['name', 'visits', 'budget', 'prospects', 'conversions', 'cpp'];

  /** Cost-per-conversion bars — rebuilt on data or light/dark toggle. */
  protected readonly costChart = computed<EChartsCoreOption | null>(() => {
    const rows = this.campaigns().filter((c) => c.costPerConversion !== null);
    if (rows.length === 0) return null;
    const p = this.charts.palette();
    const ax = this.charts.axis();
    return {
      ...this.charts.base(),
      tooltip: { trigger: 'axis', valueFormatter: (v: number | string) => `${v}` },
      grid: { left: 56, right: 12, top: 24, bottom: 28 },
      xAxis: { type: 'category', data: rows.map((c) => c.name), ...ax, axisLabel: { ...ax.axisLabel, interval: 0, rotate: 18 } },
      yAxis: { type: 'value', ...ax },
      series: [
        {
          type: 'bar',
          data: rows.map((c) => c.costPerConversion),
          itemStyle: { color: p.gold, borderRadius: [6, 6, 0, 0] },
          emphasis: { itemStyle: { color: p.info } },
        },
      ],
    };
  });

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.marketing
      .roi(this.days())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.campaigns.set(res.data?.campaigns ?? []);
          this.totals.set(res.data?.totals ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }
}

import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LeadPipelineService } from '../lead-pipeline/lead-pipeline.service';
import { nextStage, ProspectDetail, STAGE_META, ProspectStage } from '../lead-pipeline/lead.models';
import { ApiError } from '../../../../core/http/api-error';

const COMM_TYPES = ['call', 'email', 'text', 'zoom', 'whatsapp'] as const;
const INTEREST_LEVELS = ['hot', 'warm', 'cold'] as const;

const toInputDate = (d: Date): string => d.toISOString().slice(0, 10);

/**
 * @title Prospect detail — bio, conversion journey, activity timeline.
 *
 * Single place to work a prospect: advance stage, log every touch,
 * convert with confidence. OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-prospect-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, MatButtonModule, MatChipsModule, MatIconModule, MatInputModule,
    MatProgressBarModule, MatSelectModule, ReactiveFormsModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a routerLink="../board">Pipeline</a> &gt;
        <span>{{ names() }}</span>
      </div>
    </section>

    <section class="detail-page">
      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      @if (error(); as err) {
        <p class="error" role="alert">
          {{ err }}
          <button mat-button (click)="reload()">Retry</button>
        </p>
      }

      @if (issuedCode(); as issued) {
        <div class="code-banner" role="status">
          <mat-icon>celebration</mat-icon>
          <div>
            <strong>{{ issued.name }}</strong> is ready to enroll. Share this code:
            <code>{{ issued.code }}</code>
          </div>
          <button mat-icon-button (click)="issuedCode.set(null)" aria-label="Dismiss">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      @if (lead(); as prospect) {
        <div class="detail-head">
          <div>
            <h2>{{ names() }}</h2>
            <p class="subtitle">
              {{ prospect.prospectPhone }} · {{ prospect.prospectEmail || 'no email' }} ·
              via {{ prospect.prospectSource }}
            </p>
          </div>
          <mat-chip [style.background]="chip().color" [style.color]="chip().text" highlighted>
            {{ chip().label }}
          </mat-chip>
        </div>

        <div class="journey dp-card">
          <div><strong>Journey:</strong> joined {{ prospect.createdAt | date:'mediumDate' }}</div>
          <div>{{ daysInStage() }} days in current stage</div>
          <div>{{ touchCount() }} logged touches</div>
        </div>

        <div class="detail-actions">
          @if (next(); as nxt) {
            <button mat-flat-button color="primary" (click)="advance(nxt)" [disabled]="acting()">
              Advance to {{ nxt }}
            </button>
          }
          @if (canClose()) {
            <button mat-button (click)="advance('Closed')" [disabled]="acting()">Mark lost</button>
          }
          @if (canConvert()) {
            @if (confirming()) {
              <button mat-flat-button color="accent" (click)="convert()" [disabled]="acting()">Confirm convert?</button>
              <button mat-button (click)="confirming.set(false)">Cancel</button>
            } @else {
              <button mat-flat-button color="accent" (click)="confirming.set(true)">Convert</button>
            }
          }
          @if (isConverted()) {
            <span class="muted">Enrolled ✓</span>
          }
          @if (!isConverted()) {
            <a mat-button [routerLink]="['../booking', prospectId()]" title="Book a chat">Book session</a>
          }
          <button mat-button (click)="toggleLogForm()">{{ showLogForm() ? 'Cancel' : 'Log activity' }}</button>
        </div>

        @if (showLogForm()) {
          <form class="log-form dp-card" [formGroup]="logForm" (ngSubmit)="saveLog()">
            <div class="two-col">
              <mat-form-field appearance="outline">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  @for (t of commTypes; track t) {
                    <mat-option [value]="t">{{ t }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Interest</mat-label>
                <mat-select formControlName="interestLevel">
                  @for (level of interestLevels; track level) {
                    <mat-option [value]="level">{{ level }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
            <div class="two-col">
              <mat-form-field appearance="outline">
                <mat-label>Date</mat-label>
                <input matInput type="date" formControlName="date" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Duration (min)</mat-label>
                <input matInput type="number" min="0" formControlName="duration" />
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>What happened?</mat-label>
              <textarea matInput rows="3" formControlName="description" maxlength="5000"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Next action</mat-label>
              <input matInput formControlName="followUpAction" maxlength="500" placeholder="e.g. Call Thursday with pricing" />
            </mat-form-field>
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="logForm.invalid || logging()">
                {{ logging() ? 'Saving…' : 'Save activity' }}
              </button>
              @if (logError(); as err) {
                <span class="error" role="alert">{{ err }}</span>
              }
            </div>
          </form>
        }

        <h3>Activity timeline ({{ timeline().length }})</h3>
        @if (timeline().length > 0) {
          <ol class="timeline">
            @for (comm of timeline(); track comm.id ?? comm.date ?? $index) {
              <li class="timeline-item dp-card">
                <mat-icon>{{ commIcon(comm.type) }}</mat-icon>
                <div class="timeline-body">
                  <div class="timeline-top">
                    <strong>{{ comm.type }}</strong>
                    @if (comm.interestLevel) {
                      <span class="dp-status dp-status--info">{{ comm.interestLevel }}</span>
                    }
                    <span class="muted">{{ comm.date | date:'medium' }}</span>
                  </div>
                  @if (comm.description) {
                    <p>{{ comm.description }}</p>
                  }
                  @if (comm.followUpAction) {
                    <p class="muted">Next: {{ comm.followUpAction }}</p>
                  }
                </div>
              </li>
            }
          </ol>
        } @else {
          <p class="empty">No touches logged yet — log the first one above.</p>
        }
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .detail-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .detail-page h3 { margin: 0.5em 0 0; }
    .detail-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1em; flex-wrap: wrap; }
    .detail-head h2 { margin: 0; text-transform: capitalize; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .journey { display: flex; gap: 1.5em; flex-wrap: wrap; padding: 0.8em 1em; font-size: 0.9em; }
    .detail-actions { display: flex; gap: 0.4em; flex-wrap: wrap; align-items: center; }
    .log-form { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75em; }
    @media only screen and (max-width: 600px) {
      .two-col { grid-template-columns: 1fr; }
    }
    .form-actions { display: flex; align-items: center; gap: 0.75em; }
    .timeline { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.6em; }
    .timeline-item { display: flex; gap: 0.8em; padding: 0.8em 1em; }
    .timeline-item mat-icon { color: var(--dp-gold); }
    .timeline-body { flex: 1; display: flex; flex-direction: column; gap: 0.25em; }
    .timeline-body p { margin: 0; }
    .timeline-top { display: flex; align-items: center; gap: 0.6em; flex-wrap: wrap; text-transform: capitalize; }
    .code-banner { display: flex; align-items: center; gap: 0.75em; background: var(--dp-success-bg); border: 1px solid var(--dp-success); border-radius: 8px; padding: 0.75em 1em; }
    .code-banner code { font-size: 1.2em; font-weight: 700; letter-spacing: 0.1em; background: var(--dp-surface); padding: 0.1em 0.5em; border-radius: 4px; }
    .code-banner div { flex: 1; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
  `],
})
export class ProspectDetailComponent implements OnInit {
  private readonly leads = inject(LeadPipelineService);
  private readonly routes = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly acting = signal(false);
  protected readonly logging = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly logError = signal<string | null>(null);
  protected readonly lead = signal<ProspectDetail | null>(null);
  protected readonly confirming = signal(false);
  protected readonly issuedCode = signal<{ name: string; code: string } | null>(null);
  protected readonly showLogForm = signal(false);

  protected readonly commTypes = [...COMM_TYPES];
  protected readonly interestLevels = [...INTEREST_LEVELS];

  protected readonly logForm = this.fb.nonNullable.group({
    type: ['call' as (typeof COMM_TYPES)[number], Validators.required],
    interestLevel: ['warm' as (typeof INTEREST_LEVELS)[number], Validators.required],
    date: [toInputDate(new Date()), Validators.required],
    duration: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(5000)]],
    followUpAction: [''],
  });

  protected readonly timeline = computed(() => {
    const comms = [...(this.lead()?.communications ?? [])];
    comms.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
    return comms;
  });

  protected readonly touchCount = computed(() => this.lead()?.communications?.length ?? 0);

  protected readonly chip = computed(() => {
    const stage = (this.lead()?.status?.stage ?? 'New') as ProspectStage;
    return STAGE_META[stage] ?? STAGE_META.New;
  });

  protected readonly next = computed(() => nextStage(this.lead()?.status?.stage));

  protected readonly daysInStage = computed(() => {
    const s = this.lead()?.status;
    const raw = s?.stageEnteredAt ?? this.lead()?.updatedAt ?? this.lead()?.createdAt;
    if (!raw) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(raw).getTime()) / 86400000));
  });

  ngOnInit(): void {
    this.routes.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) this.load(id);
      });
  }

  protected prospectId(): string {
    return this.routes.snapshot.paramMap.get('id') ?? '';
  }

  protected names(): string {
    const lead = this.lead();
    if (!lead) return 'Prospect';
    return this.leads.prospectName(lead);
  }

  protected canConvert(): boolean {
    const stage = this.lead()?.status?.stage ?? 'New';
    return stage !== 'Converted' && stage !== 'Closed';
  }

  protected canClose(): boolean {
    const stage = this.lead()?.status?.stage ?? 'New';
    return stage !== 'Converted' && stage !== 'Closed';
  }

  protected isConverted(): boolean {
    return this.lead()?.status?.stage === 'Converted';
  }

  protected commIcon(type: string | undefined): string {
    switch (type) {
      case 'call': return 'call';
      case 'email': return 'email';
      case 'text': return 'sms';
      case 'zoom': return 'videocam';
      case 'whatsapp': return 'chat';
      default: return 'event_note';
    }
  }

  protected load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.leads
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.lead.set(res.data ?? null);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected reload(): void {
    const id = this.prospectId();
    if (id) this.load(id);
  }

  protected toggleLogForm(): void {
    this.showLogForm.set(!this.showLogForm());
    this.logError.set(null);
  }

  protected advance(stage: ProspectStage): void {
    const id = this.prospectId();
    if (!id) return;
    this.acting.set(true);
    this.leads
      .advanceStage(id, stage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.acting.set(false);
          this.reload();
        },
        error: (err: ApiError) => {
          this.acting.set(false);
          this.error.set(err.message);
        },
      });
  }

  protected convert(): void {
    const id = this.prospectId();
    if (!id) return;
    this.confirming.set(false);
    this.acting.set(true);
    this.leads
      .convert(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.acting.set(false);
          this.issuedCode.set({ name: this.names(), code: res.data.code });
          this.reload();
        },
        error: (err: ApiError) => {
          this.acting.set(false);
          this.error.set(err.message);
        },
      });
  }

  protected saveLog(): void {
    if (this.logForm.invalid) return;
    const id = this.prospectId();
    if (!id) return;
    this.logging.set(true);
    this.logError.set(null);
    const v = this.logForm.getRawValue();
    this.leads
      .logCommunication(id, {
        type: v.type,
        interestLevel: v.interestLevel,
        date: v.date,
        duration: Number(v.duration),
        description: v.description.trim(),
        followUpAction: v.followUpAction.trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.logging.set(false);
          this.showLogForm.set(false);
          this.reload();
        },
        error: (err: ApiError) => {
          this.logging.set(false);
          this.logError.set(err.message);
        },
      });
  }
}

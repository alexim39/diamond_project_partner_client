import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../../core/events/event.service';
import { AvatarComponent } from '../../../_common/avatar.component';
import { AudienceScope, CommunityEvent, RsvpStatus } from '../../../core/events/event.models';
import { ApiError } from '../../../core/http/api-error';

const toInputDateTime = (d: Date): string => {
  const pad = (v: number): string => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Tomorrow at 09:00 local — sensible default start. */
const defaultStart = (): Date => {
  const d = new Date(Date.now() + 86400000);
  d.setHours(9, 0, 0, 0);
  return d;
};

/** Merge a picker date with a picker time into one local Date. */
const mergeDateTime = (date: Date, time: Date): Date => {
  const out = new Date(date);
  out.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return out;
};

/** End is valid only as a complete pair (or fully empty). */
const endsPairValidator = (group: AbstractControl): ValidationErrors | null => {
  const date = group.get('endsDate')?.value;
  const time = group.get('endsTime')?.value;
  return (date == null) === (time == null) ? null : { endsIncomplete: true };
};

/**
 * @title Events — group gatherings with RSVP headcounts.
 *
 * Upcoming (visible to you) plus your own, with per-status counts and
 * one-tap RSVP. Visibility is enforced server-side like the feed.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-community-events',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AvatarComponent, DatePipe, MatButtonModule, MatButtonToggleModule, MatDatepickerModule, MatNativeDateModule,
    MatTimepickerModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule,
    ReactiveFormsModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a routerLink="../">Community</a> &gt;
        <span>Events</span>
      </div>
    </section>

    <section class="events-page">
      <div class="page-head">
        <div>
          <h2>Events</h2>
          <p class="subtitle">Gatherings worth showing up for.</p>
        </div>
        <div class="head-actions">
          <mat-button-toggle-group [value]="tab()" (change)="tab.set($event.value)" aria-label="Event list">
            <mat-button-toggle value="upcoming">Upcoming</mat-button-toggle>
            <mat-button-toggle value="mine">My events</mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-button (click)="toggleCompose()">{{ showCompose() ? 'Cancel' : 'New event' }}</button>
        </div>
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

      @if (showCompose()) {
        <form class="compose-form dp-card" [formGroup]="form" (ngSubmit)="publish()">
          <mat-form-field appearance="outline">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" maxlength="120" placeholder="e.g. Saturday cell meeting" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Details</mat-label>
            <textarea matInput rows="3" formControlName="body" maxlength="2000"></textarea>
          </mat-form-field>
          <div class="two-col">
            <mat-form-field appearance="outline">
              <mat-label>Starts date</mat-label>
              <input matInput [matDatepicker]="startsDatePicker" formControlName="startsDate" />
              <mat-datepicker-toggle matSuffix [for]="startsDatePicker" />
              <mat-datepicker #startsDatePicker />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Starts time</mat-label>
              <input matInput [matTimepicker]="startsTimePicker" formControlName="startsTime" />
              <mat-timepicker-toggle matSuffix [for]="startsTimePicker" />
              <mat-timepicker #startsTimePicker interval="30m" />
            </mat-form-field>
          </div>
          <div class="two-col">
            <mat-form-field appearance="outline">
              <mat-label>Ends date (optional)</mat-label>
              <input
                matInput
                [matDatepicker]="endsDatePicker"
                formControlName="endsDate"
                [min]="form.controls.startsDate.value"
              />
              <mat-datepicker-toggle matSuffix [for]="endsDatePicker" />
              <mat-datepicker #endsDatePicker />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Ends time (optional)</mat-label>
              <input matInput [matTimepicker]="endsTimePicker" formControlName="endsTime" />
              <mat-timepicker-toggle matSuffix [for]="endsTimePicker" />
              <mat-timepicker #endsTimePicker interval="30m" />
              @if (form.hasError('endsIncomplete')) {
                <mat-error>Pick both an end date and time.</mat-error>
              }
            </mat-form-field>
          </div>
          <div class="two-col">
            <mat-form-field appearance="outline">
              <mat-label>Venue (optional)</mat-label>
              <input matInput formControlName="location" maxlength="200" placeholder="e.g. Ikeja hall" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Audience</mat-label>
              <mat-select formControlName="scope">
                <mat-option value="global">Everyone</mat-option>
                <mat-option value="team">My team</mat-option>
                <mat-option value="leadership">Leadership</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || publishing()">
              {{ publishing() ? 'Creating…' : 'Create event' }}
            </button>
            @if (publishError(); as err) {
              <span class="error" role="alert">{{ err }}</span>
            }
          </div>
        </form>
      }

      @if (visible().length > 0) {
        <ol class="event-list">
          @for (event of visible(); track event.id) {
            <li class="dp-card event-card">
              <div class="event-top">
                <div>
                  <strong>{{ event.title }}</strong>
                  <span class="muted byline"> · <async-avatar [photo]="event.author?.profileImage" [name]="event.author?.name ?? 'Teammate'" size="xs" />{{ event.author?.name ?? 'Teammate' }}</span>
                </div>
                <span class="muted">{{ event.startsAt | date:'medium' }}</span>
              </div>
              <p>{{ event.body }}</p>
              @if (event.location) {
                <p class="muted"><mat-icon>place</mat-icon> {{ event.location }}</p>
              }
              <div class="rsvp-row" role="group" aria-label="RSVP">
                @for (opt of rsvpOptions; track opt.value) {
                  <button
                    mat-button
                    [color]="event.myRsvp === opt.value ? 'primary' : undefined"
                    (click)="rsvp(event, opt.value)"
                    [disabled]="actingId() === event.id"
                  >{{ opt.label }} ({{ event.rsvps[opt.value] ?? 0 }})</button>
                }
                <span class="spacer"></span>
                @if (isMine(event)) {
                  <button mat-button color="warn" (click)="cancel(event)" [disabled]="actingId() === event.id">Cancel event</button>
                }
              </div>
            </li>
          }
        </ol>
      } @else if (!loading() && !error()) {
        <p class="empty">
          @if (tab() === 'upcoming') {
            Nothing scheduled — check back soon or create one.
          } @else {
            You haven't created any events yet.
          }
        </p>
      }
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .events-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); }
    .head-actions { display: flex; gap: 0.5em; align-items: center; flex-wrap: wrap; }
    .compose-form { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75em; }
    .form-actions { display: flex; align-items: center; gap: 0.75em; }
    .event-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.75em; }
    .event-card { padding: 1em; display: flex; flex-direction: column; gap: 0.5em; }
    .event-card p { margin: 0; }
    .event-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75em; flex-wrap: wrap; }
    .byline { display: inline-flex; align-items: center; gap: 0.4em; }
    .event-top .muted mat-icon, p.muted mat-icon { font-size: 16px; height: 16px; width: 16px; vertical-align: -3px; }
    .rsvp-row { display: flex; align-items: center; gap: 0.1em; flex-wrap: wrap; border-top: 1px solid var(--dp-line); padding-top: 0.5em; }
    .rsvp-row .spacer { flex: 1; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); display: flex; align-items: center; gap: 0.5em; }
    .empty { color: var(--dp-muted); }
    @media only screen and (max-width: 600px) {
      .two-col { grid-template-columns: 1fr; }
    }
  `],
})
export class CommunityEventsComponent implements OnInit {
  private readonly events = inject(EventService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly publishing = signal(false);
  protected readonly actingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly publishError = signal<string | null>(null);
  protected readonly showCompose = signal(false);
  protected readonly tab = signal<'upcoming' | 'mine'>('upcoming');
  protected readonly upcoming = signal<CommunityEvent[]>([]);
  protected readonly mine = signal<CommunityEvent[]>([]);

  protected readonly rsvpOptions: Array<{ label: string; value: RsvpStatus }> = [
    { label: 'Going', value: 'going' },
    { label: 'Interested', value: 'interested' },
    { label: 'Declined', value: 'declined' },
  ];

  protected readonly form = this.fb.group(
    {
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      body: ['', [Validators.required, Validators.maxLength(2000)]],
      startsDate: [defaultStart(), Validators.required],
      startsTime: [defaultStart(), Validators.required],
      endsDate: [null as Date | null],
      endsTime: [null as Date | null],
      location: ['', Validators.maxLength(200)],
      scope: ['global' as AudienceScope, Validators.required],
    },
    { validators: endsPairValidator },
  );

  protected visible(): CommunityEvent[] {
    return this.tab() === 'upcoming' ? this.upcoming() : this.mine();
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ upcoming: this.events.upcoming(), mine: this.events.mine() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ upcoming, mine }) => {
          this.upcoming.set(upcoming.data?.items ?? []);
          this.mine.set(mine.data?.items ?? []);
          this.loading.set(false);
        },
        error: (err: ApiError) => {
          this.error.set(err.message);
          this.loading.set(false);
        },
      });
  }

  protected toggleCompose(): void {
    this.showCompose.set(!this.showCompose());
    this.publishError.set(null);
  }

  protected isMine(event: CommunityEvent): boolean {
    return this.mine().some((m) => m.id === event.id);
  }

  protected publish(): void {
    if (this.form.invalid) return;
    this.publishing.set(true);
    this.publishError.set(null);
    const v = this.form.getRawValue();
    const startsAt = toInputDateTime(mergeDateTime(v.startsDate!, v.startsTime!));
    const endsAt = v.endsDate && v.endsTime ? toInputDateTime(mergeDateTime(v.endsDate, v.endsTime)) : null;
    this.events
      .create({
        title: (v.title ?? '').trim(),
        body: (v.body ?? '').trim(),
        startsAt,
        ...(endsAt ? { endsAt } : {}),
        location: (v.location ?? '').trim(),
        scope: v.scope ?? 'global',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.publishing.set(false);
          this.showCompose.set(false);
          this.form.reset({
            title: '', body: '', startsDate: defaultStart(), startsTime: defaultStart(),
            endsDate: null, endsTime: null, location: '', scope: 'global',
          });
          this.tab.set('mine');
          this.reload();
        },
        error: (err: ApiError) => {
          this.publishing.set(false);
          this.publishError.set(err.message);
        },
      });
  }

  protected rsvp(event: CommunityEvent, status: RsvpStatus): void {
    this.actingId.set(event.id);
    this.events
      .rsvp(event.id, status)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.actingId.set(null);
          const counts = res.data?.counts;
          const patch = (list: CommunityEvent[]): CommunityEvent[] => list.map((e) =>
            e.id === event.id ? { ...e, myRsvp: status, ...(counts ? { rsvps: counts } : {}) } : e,
          );
          this.upcoming.set(patch(this.upcoming()));
          this.mine.set(patch(this.mine()));
        },
        error: (err: ApiError) => {
          this.actingId.set(null);
          this.error.set(err.message);
        },
      });
  }

  protected cancel(event: CommunityEvent): void {
    this.actingId.set(event.id);
    this.events
      .cancel(event.id)
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

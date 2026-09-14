import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { PartnerInterface } from '../../../../../../_common/services/partner.service';
import { CreateCampaignService } from '../create-campaign.service';
import { ApiError } from '../../../../../../core/http/api-error';

type Channel = 'facebook' | 'youtube' | 'linkedin';

const CHANNELS: Array<{ value: Channel; label: string; minimum: number; hint: string }> = [
  { value: 'facebook', label: 'Facebook (+ Instagram)', minimum: 6500, hint: 'Feed, Stories, Messenger and Audience Network' },
  { value: 'youtube', label: 'YouTube', minimum: 18000, hint: 'Video ads before and beside videos' },
  { value: 'linkedin', label: 'LinkedIn', minimum: 10500, hint: 'Professional audience and decision makers' },
];

const OBJECTIVES = ['Brand awareness', 'Reach', 'Messages', 'Conversions', 'Traffic', 'Engagement', 'Video views', 'Lead generation'];
const MEASURES = ['Return on Ad Spend (ROAS)', 'Cost per Click (CPC)', 'Cost per Thousand Impressions (CPM)', 'Cost per Acquisition (CPA)', 'Engagement rate'];
const AGES = ['All', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const GENDERS = ['All', 'Men', 'Women'];
const LOCATIONS = ['States', 'Countries'];
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];
const EDUCATION = ['All', 'High School', 'College', 'Graduate School'];
const RELATIONSHIPS = ['All', 'Single', 'Married', 'In a Relationship'];
const BUDGET_TYPES = ['Daily budget', 'Lifetime budget'];
const FORMATS = ['Single Image Ad', 'Video Ad', 'Carousel Ad (multiple images or videos)', 'Stories Ad'];
const DEVICES = ['All devices', 'Mobile only', 'Desktop only'];
const FB_PLACEMENTS = ['FacebookFeed', 'InstagramFeed', 'InstagramStories', 'FacebookStories', 'AudienceNetwork', 'MessengerInbox'] as const;

/**
 * @title Start a campaign — one wizard for every channel.
 *
 * The admin team runs the actual ad; this form collects one record set no
 * matter the channel (audience, objective, budget, flight, format), shows
 * the live channel minimum and wallet balance before money moves, and
 * lands on My campaigns with leads flowing to the general contact list.
 * OnPush + signals, fully typed.
 */
@Component({
  selector: 'async-campaign-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, CurrencyPipe, DatePipe, MatButtonModule, MatCheckboxModule, MatDatepickerModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, MatSelectModule,
    ReactiveFormsModule, RouterModule,
  ],
  template: `
    <section class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <a routerLink="/dashboard">Dashboard</a> &gt;
        <a>Marketing</a> &gt;
        <a>Campaigns</a> &gt;
        <span>Start a campaign</span>
      </div>
    </section>

    <section class="wizard-page">
      <div class="page-head">
        <div>
          <h2>Start a campaign</h2>
          <p class="subtitle">Describe what you want — our admin team runs the ad, leads land in your general contact list.</p>
        </div>
        <a mat-button routerLink="../manage">My campaigns</a>
      </div>

      @if (saving()) {
        <mat-progress-bar mode="indeterminate" />
      }

      <form class="dp-card form-card" [formGroup]="form" (ngSubmit)="onSubmit()">
        <p class="form-section-label">1 · Goal & channel</p>
        <mat-form-field appearance="outline">
          <mat-label>Campaign name (optional)</mat-label>
          <input matInput formControlName="title" maxlength="120" placeholder="e.g. September sales push" />
        </mat-form-field>
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Channel</mat-label>
            <mat-select formControlName="channel">
              @for (c of channels; track c.value) {
                <mat-option [value]="c.value">{{ c.label }} · min ₦{{ c.minimum | number }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <p class="hint">{{ channelHint() }}</p>
        </div>
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Primary objective</mat-label>
            <mat-select formControlName="adObjective">
              @for (o of objectives; track o) {
                <mat-option [value]="o">{{ o }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Success measure</mat-label>
            <mat-select formControlName="successMeasurement">
              @for (m of measures; track m) {
                <mat-option [value]="m">{{ m }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <p class="form-section-label">2 · Audience</p>
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Age range</mat-label>
            <mat-select formControlName="ageRangeTarget">
              @for (a of ages; track a) {
                <mat-option [value]="a">{{ a }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="genderTarget">
              @for (g of genders; track g) {
                <mat-option [value]="g">{{ g }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="three-col">
          <mat-form-field appearance="outline">
            <mat-label>Location</mat-label>
            <mat-select formControlName="locationTarget">
              @for (l of locations; track l) {
                <mat-option [value]="l">{{ l }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Education</mat-label>
            <mat-select formControlName="educationTarget">
              @for (e of education; track e) {
                <mat-option [value]="e">{{ e }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Relationship status</mat-label>
            <mat-select formControlName="relationshipTarget">
              @for (r of relationships; track r) {
                <mat-option [value]="r">{{ r }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        @if (form.get('locationTarget')?.value === 'States') {
          <mat-form-field appearance="outline">
            <mat-label>Target states</mat-label>
            <mat-select formControlName="locationStates" multiple>
              @for (s of nigerianStates; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
            <mat-hint>Admin runs the ad only in these states</mat-hint>
            @if (form.get('locationStates')?.hasError('required') && form.get('locationStates')?.touched) {
              <mat-error>Pick at least one state</mat-error>
            }
          </mat-form-field>
        } @else {
          <mat-form-field appearance="outline">
            <mat-label>Target countries (comma separated)</mat-label>
            <input matInput formControlName="locationCountries" maxlength="500" placeholder="e.g. Nigeria, Ghana, UK" />
            <mat-hint>Admin runs the ad in these countries</mat-hint>
            @if (form.get('locationCountries')?.hasError('required') && form.get('locationCountries')?.touched) {
              <mat-error>Enter at least one country</mat-error>
            }
          </mat-form-field>
        }

        <p class="form-section-label">3 · Budget & flight</p>
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Budget type</mat-label>
            <mat-select formControlName="budgetType">
              @for (b of budgetTypes; track b) {
                <mat-option [value]="b">{{ b }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Budget amount (₦)</mat-label>
            <input matInput type="number" min="1" formControlName="budgetAmount" />
            <mat-hint>Minimum for {{ channelLabel() }}: ₦{{ channelMinimum() | number }} · balance ₦{{ balance() | number }}</mat-hint>
            @if (form.get('budgetAmount')?.hasError('min') && form.get('budgetAmount')?.touched) {
              <mat-error>Below the {{ channelLabel() }} minimum of ₦{{ channelMinimum() | number }}</mat-error>
            }
          </mat-form-field>
        </div>
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Start date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="campaignStartDate" [min]="minDate" />
            <mat-datepicker-toggle matSuffix [for]="startPicker" />
            <mat-datepicker #startPicker />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="campaignEndDate" [min]="form.controls.campaignStartDate.value ?? minDate" />
            <mat-datepicker-toggle matSuffix [for]="endPicker" />
            <mat-datepicker #endPicker />
          </mat-form-field>
        </div>
        <mat-checkbox formControlName="noEndDate">Run continuously (no end date)</mat-checkbox>
        @if (durationDays() !== null) {
          <p class="muted">Flight: {{ durationDays() }} day{{ durationDays() === 1 ? '' : 's' }}</p>
        }

        <p class="form-section-label">4 · Format</p>
        <div class="two-col">
          <mat-form-field appearance="outline">
            <mat-label>Ad format</mat-label>
            <mat-select formControlName="adFormat">
              @for (f of formats; track f) {
                <mat-option [value]="f">{{ f }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Devices</mat-label>
            <mat-select formControlName="deviceType">
              @for (d of devices; track d) {
                <mat-option [value]="d">{{ d }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        @if (form.get('channel')?.value === 'facebook') {
          <div class="placements" role="group" aria-label="Placements">
            <span class="muted">Show on</span>
            @for (p of fbPlacements; track p) {
              <mat-checkbox [formControlName]="p">{{ placementLabel(p) }}</mat-checkbox>
            }
          </div>
        }

        <p class="form-section-label">5 · Review</p>
        <div class="dp-card review" aria-label="Campaign summary">
          <div><strong>{{ reviewTitle() }}</strong> <span class="muted">· {{ channelLabel() }}</span></div>
          <div class="muted">{{ form.get('adObjective')?.value }} · {{ form.get('budgetType')?.value }} {{ budgetAmount() | currency:'₦':'symbol':'1.0-0' }}</div>
          <div class="muted">Targets: {{ reviewTargets() }}</div>
          <div class="muted">Leads land in your general contact list · held from wallet now, run by admin</div>
          <div class="muted">Landing page: diamondprojectonline.com/{{ partner?.username ?? '' }}</div>
        </div>

        <div class="form-actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || saving() || !canAfford()">
            {{ saving() ? 'Publishing…' : 'Publish campaign' }}
          </button>
          @if (!canAfford() && budgetAmount() > 0) {
            <span class="error" role="alert">Insufficient balance — fund your wallet first.</span>
          }
          @if (formError(); as err) {
            <span class="error" role="alert">{{ err }}</span>
          }
        </div>
      </form>
    </section>
  `,
  styles: [`
    .breadcrumb-wrapper { margin-bottom: 1em; }
    .breadcrumb a { text-decoration: none; }
    .wizard-page { display: flex; flex-direction: column; gap: 1em; padding-bottom: 2em; }
    .page-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em; }
    .page-head h2 { margin: 0; }
    .page-head a { min-height: 44px; }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .form-card { padding: 1em; display: flex; flex-direction: column; gap: 0.75em; }
    .form-section-label { font-size: 0.78em; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dp-gold-ink); margin: 0.4em 0 -0.3em; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75em; align-items: start; }
    .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75em; }
    @media only screen and (max-width: 600px) {
      .two-col, .three-col { grid-template-columns: 1fr; }
    }
    .hint { margin: 0; align-self: center; color: var(--dp-muted); font-size: 0.85em; }
    .placements { display: flex; gap: 0.75em; flex-wrap: wrap; align-items: center; }
    .review { padding: 0.9em 1em; display: flex; flex-direction: column; gap: 0.3em; background: var(--dp-paper); }
    .form-actions { display: flex; align-items: center; gap: 0.75em; flex-wrap: wrap; }
    .form-actions button { min-height: 44px; }
    .muted { color: var(--dp-muted); font-size: 0.85em; }
    .error { color: var(--dp-error); }
    html[data-theme='dark'] .error { color: #e89a9a; }
  `],
})
export class CampaignWizardComponent implements OnInit {
  @Input() partner!: PartnerInterface;

  private readonly fb = inject(FormBuilder);
  private readonly campaigns = inject(CreateCampaignService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly channels = CHANNELS;
  protected readonly objectives = OBJECTIVES;
  protected readonly measures = MEASURES;
  protected readonly ages = AGES;
  protected readonly genders = GENDERS;
  protected readonly locations = LOCATIONS;
  protected readonly nigerianStates = NIGERIAN_STATES;
  protected readonly education = EDUCATION;
  protected readonly relationships = RELATIONSHIPS;
  protected readonly budgetTypes = BUDGET_TYPES;
  protected readonly formats = FORMATS;
  protected readonly devices = DEVICES;
  protected readonly fbPlacements = [...FB_PLACEMENTS];
  protected readonly minDate = new Date();

  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: [''],
    channel: ['facebook' as Channel, Validators.required],
    adObjective: ['Lead generation', Validators.required],
    successMeasurement: ['Cost per Acquisition (CPA)', Validators.required],
    ageRangeTarget: ['All', Validators.required],
    genderTarget: ['All', Validators.required],
    locationTarget: ['States', Validators.required],
    locationStates: [<string[]>[], Validators.required],
    locationCountries: [''],
    educationTarget: ['All', Validators.required],
    relationshipTarget: ['All', Validators.required],
    budgetType: ['Lifetime budget', Validators.required],
    budgetAmount: [6500, [Validators.required, Validators.min(1)]],
    campaignStartDate: [new Date() as Date | null, Validators.required],
    campaignEndDate: [null as Date | null],
    noEndDate: [false],
    adFormat: ['Single Image Ad', Validators.required],
    deviceType: ['All devices', Validators.required],
    FacebookFeed: [true],
    InstagramFeed: [false],
    InstagramStories: [false],
    FacebookStories: [false],
    AudienceNetwork: [false],
    MessengerInbox: [false],
  });

  ngOnInit(): void {
    this.form.get('channel')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((channel) => this.applyChannelMinimum(channel ?? 'facebook'));
    this.applyChannelMinimum(this.form.get('channel')?.value ?? 'facebook');
    this.form.get('locationTarget')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyLocationValidators());
    this.applyLocationValidators();
    this.form.get('noEndDate')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((continuous) => this.applyEndDateState(!!continuous));
    this.applyEndDateState(!!this.form.get('noEndDate')?.value);
  }

  /** States need picks, Countries need text — the idle control stays inert. */
  private applyLocationValidators(): void {
    const scope = this.form.get('locationTarget')?.value ?? 'States';
    const states = this.form.get('locationStates');
    const countries = this.form.get('locationCountries');
    if (scope === 'Countries') {
      states?.clearValidators();
      states?.setValue([]);
      countries?.setValidators([Validators.required, Validators.maxLength(500)]);
    } else {
      countries?.clearValidators();
      countries?.setValue('');
      states?.setValidators([Validators.required]);
    }
    states?.updateValueAndValidity({ emitEvent: false });
    countries?.updateValueAndValidity({ emitEvent: false });
  }

  /** Continuous runs have no end — the control disables instead of lingering. */
  private applyEndDateState(continuous: boolean): void {
    const end = this.form.get('campaignEndDate');
    if (continuous) {
      end?.setValue(null);
      end?.clearValidators();
      end?.disable({ emitEvent: false });
    } else {
      end?.enable({ emitEvent: false });
      end?.setValidators([Validators.required]);
    }
    end?.updateValueAndValidity({ emitEvent: false });
  }

  protected channelMinimum(): number {
    return CHANNELS.find((c) => c.value === this.form.get('channel')?.value)?.minimum ?? 6500;
  }

  protected channelLabel(): string {
    return CHANNELS.find((c) => c.value === this.form.get('channel')?.value)?.label ?? 'Facebook';
  }

  protected channelHint(): string {
    return CHANNELS.find((c) => c.value === this.form.get('channel')?.value)?.hint ?? '';
  }

  protected balance(): number {
    return Number(this.partner?.balance ?? 0);
  }

  protected budgetAmount(): number {
    return Number(this.form.get('budgetAmount')?.value ?? 0);
  }

  protected canAfford(): boolean {
    return this.balance() >= this.budgetAmount();
  }

  protected durationDays(): number | null {
    if (this.form.get('noEndDate')?.value) return null;
    const start = this.form.get('campaignStartDate')?.value;
    const end = this.form.get('campaignEndDate')?.value;
    if (!(start instanceof Date) || !(end instanceof Date)) return null;
    const days = Math.round((end.getTime() - start.getTime()) / 86400000);
    return days >= 0 ? days : null;
  }

  protected reviewTitle(): string {
    const title = String(this.form.get('title')?.value ?? '').trim();
    return title || 'Untitled campaign';
  }

  protected reviewTargets(): string {
    const scope = this.form.get('locationTarget')?.value ?? 'States';
    if (scope === 'Countries') {
      const countries = String(this.form.get('locationCountries')?.value ?? '').trim();
      return countries || 'Countries (unspecified)';
    }
    const states = (this.form.get('locationStates')?.value ?? []) as string[];
    if (states.length === 0) return 'States (none picked yet)';
    if (states.length > 3) return `${states.length} states (${states.slice(0, 3).join(', ')}…)`;
    return states.join(', ');
  }

  protected placementLabel(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').trim();
  }

  private applyChannelMinimum(channel: Channel): void {
    const control = this.form.get('budgetAmount');
    const minimum = CHANNELS.find((c) => c.value === channel)?.minimum ?? 6500;
    control?.setValidators([Validators.required, Validators.min(1), Validators.min(minimum)]);
    control?.updateValueAndValidity({ emitEvent: false });
  }

  protected onSubmit(): void {
    Object.keys(this.form.controls).forEach((k) => this.form.get(k)?.markAsTouched());
    if (this.form.invalid || this.saving() || !this.canAfford()) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set(null);
    const scope = v.locationTarget ?? 'States';
    const locationTargets = scope === 'Countries'
      ? String(v.locationCountries ?? '').split(',').map((s) => s.trim()).filter(Boolean)
      : [...(v.locationStates ?? [])];
    this.campaigns
      .create({
        title: v.title.trim(),
        channel: v.channel,
        targetAudience: {
          ageRangeTarget: v.ageRangeTarget,
          genderTarget: v.genderTarget,
          locationTarget: scope,
          locationTargets,
          educationTarget: v.educationTarget,
          relationshipTarget: v.relationshipTarget,
        },
        marketingObjectives: {
          adObjective: v.adObjective,
          successMeasurement: v.successMeasurement,
        },
        budget: { budgetType: v.budgetType, budgetAmount: Number(v.budgetAmount) },
        adDuration: {
          campaignStartDate: v.campaignStartDate,
          campaignEndDate: v.noEndDate ? null : v.campaignEndDate,
          noEndDate: v.noEndDate,
        },
        adFormat: {
          adFormat: v.adFormat,
          deviceType: v.deviceType,
          adPreferences: {
            FacebookFeed: v.FacebookFeed,
            InstagramFeed: v.InstagramFeed,
            InstagramStories: v.InstagramStories,
            FacebookStories: v.FacebookStories,
            AudienceNetwork: v.AudienceNetwork,
            MessengerInbox: v.MessengerInbox,
          },
        },
        createdBy: this.partner._id,
        deliveryStatus: 'Pending',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/dashboard/tools/campaigns/manage']);
        },
        error: (err: ApiError) => {
          this.saving.set(false);
          this.formError.set(err.message);
        },
      });
  }
}

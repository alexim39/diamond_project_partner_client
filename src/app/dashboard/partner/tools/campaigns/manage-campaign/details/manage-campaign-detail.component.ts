import { Component, DestroyRef, inject, Input, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CampaignInterface, CampaignService } from '../manage-campaign.service';
import { AuthService } from '../../../../../../core/auth/auth.service';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';

/** @title Disabled select */
@Component({
    selector: 'async-manage-campain-detail',
    templateUrl: 'manage-campaign-detail.component.html',
    styleUrls: ['manage-campaign-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
      MatCheckboxModule,
      FormsModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatSelectModule,
      MatInputModule,
      MatIconModule, MatButtonModule,
      MatDividerModule, MatListModule, CommonModule
    ]
})
export class ManageCampaignDetailComponent implements OnInit {

  @Input() campaign!: CampaignInterface;
  campaignData!: any; 
  duration!: null | number;

  private readonly campaigns = inject(CampaignService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly summary = signal<any>(null);
  protected readonly ledger = signal<any[]>([]);
  protected readonly notice = signal<string | null>(null);
  protected readonly acting = signal(false);
  

  constructor(private router: Router, private route: ActivatedRoute) { }

  back(): void {
    //this.router.navigateByUrl('dashboard/manage-campaign');
    window.history.back();
  }

  
  ngOnInit(): void { 
    if (this.campaign.data) {
      this.campaignData = this.campaign.data;
      
    }
    this.calculateDuration();
    this.reloadAllocation();
   }

  /** Owner of this campaign (allocation controls are owner-or-admin only). */
  protected isOwner(): boolean {
    try {
      const me: any = this.auth.currentUser();
      const mine = me ? String(me.id ?? me._id ?? '') : '';
      return !!mine && String(this.campaignData?.createdBy ?? '') === mine;
    } catch {
      return false;
    }
  }

  protected isAdmin(): boolean {
    try {
      return this.auth.isAdmin();
    } catch {
      return false;
    }
  }

  protected tierLabel(tier: number): string {
    return tier === 1 ? 'Same state' : tier === 2 ? 'Nearby state' : 'Out of area';
  }

  protected reloadAllocation(): void {
    const id = String(this.campaignData?._id ?? '');
    if (!id) return;
    this.campaigns.getAllocationSummary(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res: any) => this.summary.set(res?.data ?? null), error: () => this.summary.set(null) });
    this.campaigns.getCampaignAllocations(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res: any) => this.ledger.set(res?.data ?? []), error: () => this.ledger.set([]) });
  }

  protected allocateNow(): void {
    const id = String(this.campaignData?._id ?? '');
    if (!id || this.acting()) return;
    this.acting.set(true);
    this.notice.set(null);
    this.campaigns.allocateNow(id, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.acting.set(false);
          this.notice.set(res?.message ?? 'Allocation run finished.');
          this.reloadAllocation();
        },
        error: (err: any) => {
          this.acting.set(false);
          this.notice.set(err?.error?.message ?? err?.message ?? 'Allocation failed.');
        },
      });
  }

  protected togglePaused(): void {
    const id = String(this.campaignData?._id ?? '');
    const paused = !this.summary()?.caps?.paused;
    if (!id || this.acting()) return;
    this.acting.set(true);
    this.notice.set(null);
    this.campaigns.updateAllocation(id, { paused })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.acting.set(false); this.notice.set(paused ? 'Allocation paused.' : 'Allocation resumed.'); this.reloadAllocation(); },
        error: (err: any) => { this.acting.set(false); this.notice.set(err?.error?.message ?? 'Update failed.'); },
      });
  }

  protected reportLead(allocationId: string): void {
    const reason = window.prompt('Why is this lead bad? (dead line, wrong person, …)');
    if (reason === null) return;
    if (!reason.trim() || this.acting()) return;
    this.acting.set(true);
    this.campaigns.reportAllocation(allocationId, reason.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => { this.acting.set(false); this.notice.set(res?.message ?? 'Reported.'); this.reloadAllocation(); },
        error: (err: any) => { this.acting.set(false); this.notice.set(err?.error?.message ?? 'Report failed.'); },
      });
  }

  protected duplicate(): void {
    if (this.acting()) return;
    if (!window.confirm(`Duplicate "${this.campaignData?.campaignName}"? The full budget is held again for the copy.`)) return;
    this.acting.set(true);
    this.notice.set(null);
    this.campaigns.duplicateCampaign(String(this.campaignData?._id ?? ''))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.acting.set(false);
          this.notice.set(res?.message ?? 'Duplicated.');
          const id = res?.data?._id ?? res?.data?.id;
          if (id) this.router.navigate(['/dashboard/tools/campaigns/manage']);
        },
        error: (err: any) => {
          this.acting.set(false);
          this.notice.set(err?.error?.message ?? 'Duplicate failed.');
        },
      });
  }

  protected verdict(allocationId: string, decision: 'replace' | 'reject'): void {
    if (this.acting()) return;
    const note = decision === 'reject' ? (window.prompt('Note for the partner (optional)') ?? '') : '';
    this.acting.set(true);
    this.campaigns.verdictAllocation(allocationId, decision, note)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => { this.acting.set(false); this.notice.set(res?.message ?? 'Decided.'); this.reloadAllocation(); },
        error: (err: any) => { this.acting.set(false); this.notice.set(err?.error?.message ?? 'Verdict failed.'); },
      });
  }

  private calculateDuration() {

    if (!this.campaignData.adDuration.noEndDate) {

      const startDateControl = this.campaignData.adDuration.campaignStartDate;
      const endDateControl = this.campaignData.adDuration.campaignEndDate;
      if (startDateControl && endDateControl) {
        const startDate = new Date(startDateControl);
        const endDate = new Date(endDateControl);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const durationInMilliseconds = endDate.getTime() - startDate.getTime();
          this.duration = durationInMilliseconds / (1000 * 3600 * 24);
        } /* else {
          this.duration = null;
        } */
      }
    }/*  else {
      this.duration = null;
    } */
  }


  getSelectedAdPreferences(): string[] {
    const adPreferencesGroup = this.campaignData.adFormat.adPreferences;
    if (!adPreferencesGroup) {
      return [];
    }

    const selectedPreferences = Object.keys(adPreferencesGroup)
      .filter(key => adPreferencesGroup[key])
      .map(key => this.separateCamelCase(key));

    return selectedPreferences;
  }

  statusTone(status: string): string {
    switch (String(status ?? '').toLowerCase()) {
      case 'active': return 'dp-status--ok';
      case 'paused': return 'dp-status--warn';
      case 'ended':
      case 'rejected': return 'dp-status--bad';
      default: return 'dp-status--info';
    }
  }

  /** Explicit state/country list for the admin record (legacy docs lack it). */
  targetSummary(): string {
    const targets = this.campaignData?.targetAudience?.locationTargets;
    if (Array.isArray(targets) && targets.length > 0) return targets.join(', ');
    return String(this.campaignData?.targetAudience?.locationTarget ?? '—');
  }

  private separateCamelCase(input: string): string {
    let result = '';

    for (let i = 0; i < input.length; i++) {
      const char = input.charAt(i);
      // Check if the character is uppercase and not the first character
      if (char === char.toUpperCase() && i !== 0) {
        // Separate the words at this position
        result = `${input.substring(0, i)} ${input.substring(i)}`;
        break;
      }
    }

    return result.trim();
  }

}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ProspectDetailData {
  prospect: Record<string, unknown>;
  partnerState?: string;
}

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));

interface AnswerRow {
  label: string;
  value: string;
}

/**
 * @title Lead dossier — the read-only decision card for Buy Prospect.
 *
 * Same visual language as the claim dialog: hero with match verdict,
 * intent signals first, answers grouped by what they tell you (about /
 * intent / logistics), contact masked until claim. The only action hands
 * back a claim intent — no Swal, no page reload; the opener drives the
 * claim dialog and removes the row on success.
 */
@Component({
  selector: 'async-masked-prospect-response',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Lead dossier</h2>
    <div mat-dialog-content class="dossier">
      <div class="hero">
        <span class="avatar" aria-hidden="true">{{ initials() }}</span>
        <div class="hero-text">
          <p class="lead-name">{{ fullName() }}</p>
          <div class="chip-row">
            @if (state()) {
              <span class="dp-status dp-status--info">{{ state() }}</span>
            }
            @if (nearYou()) {
              <span class="dp-status dp-status--ok">Near you</span>
            }
            @if (isHot()) {
              <span class="dp-status dp-status--bad">Hot · &lt;48h</span>
            } @else if (isNew()) {
              <span class="dp-status dp-status--warn">New</span>
            }
          </div>
          <p class="muted">{{ age() }} old · source {{ source() }}</p>
        </div>
      </div>

      @if (intentVerdict(); as verdict) {
        <p class="verdict"><mat-icon>bolt</mat-icon> {{ verdict }}</p>
      }

      @for (group of groups(); track group.title) {
        <div class="panel">
          <h3>{{ group.title }}</h3>
          @for (row of group.rows; track row.label) {
            <div class="signal">
              <span class="muted">{{ row.label }}</span>
              <strong>{{ row.value }}</strong>
            </div>
          }
        </div>
      }

      <div class="panel masked">
        <mat-icon>lock</mat-icon>
        <p class="muted">Phone and email unlock when you claim this lead.</p>
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-flat-button color="primary" (click)="claim()">Claim this lead</button>
    </div>
  `,
  styles: [`
    .dossier { display: flex; flex-direction: column; gap: 0.8em; min-width: min(440px, 82vw); }
    .hero { display: flex; gap: 0.8em; align-items: center; }
    .avatar {
      flex: 0 0 auto; width: 52px; height: 52px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.2em; color: #fff;
      background: linear-gradient(135deg, var(--dp-gold), #6b4e12);
    }
    .hero-text { display: flex; flex-direction: column; gap: 0.3em; min-width: 0; }
    .lead-name { font-size: 1.2em; font-weight: 700; margin: 0; }
    .chip-row { display: flex; gap: 0.4em; flex-wrap: wrap; }
    .muted { color: var(--dp-muted); font-size: 0.85em; margin: 0; }
    .verdict { display: flex; align-items: center; gap: 0.4em; font-weight: 700; margin: 0; color: var(--dp-gold-ink); }
    .verdict mat-icon { color: var(--dp-gold); }
    .panel { border: 1px solid var(--dp-line); border-radius: 8px; padding: 0.7em 0.8em; display: flex; flex-direction: column; gap: 0.45em; }
    .panel h3 { margin: 0; font-size: 0.78em; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dp-gold-ink); }
    .signal { display: flex; align-items: baseline; gap: 0.5em; }
    .signal strong { margin-left: auto; text-align: right; font-weight: 600; }
    .masked { flex-direction: row; align-items: center; }
    button, a[mat-flat-button], a[mat-button] { min-height: 44px; }
  `],
})
export class MaskedProspectResponseComponent {
  private readonly dialogRef = inject(MatDialogRef<MaskedProspectResponseComponent>);
  private readonly data = inject<ProspectDetailData>(MAT_DIALOG_DATA);

  private get prospect(): Record<string, unknown> {
    return (this.data.prospect ?? {}) as Record<string, unknown>;
  }

  protected fullName(): string {
    return `${str(this.prospect['name'])} ${str(this.prospect['surname'])}`.trim() || 'Unnamed lead';
  }

  protected initials(): string {
    const parts = this.fullName().split(/\s+/).filter(Boolean);
    if (parts.length === 0 || this.fullName() === 'Unnamed lead') return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  protected state(): string {
    return str(this.prospect['state']);
  }

  protected nearYou(): boolean {
    const mine = str(this.data.partnerState).trim().toLowerCase();
    const theirs = this.state().trim().toLowerCase();
    return !!mine && !!theirs && mine === theirs;
  }

  protected source(): string {
    return str(this.prospect['source'] ?? this.prospect['prospectSource'] ?? 'Survey');
  }

  protected ageMs(): number {
    const t = new Date(str(this.prospect['createdAt'])).getTime();
    return Number.isFinite(t) ? Date.now() - t : NaN;
  }

  protected isHot(): boolean {
    return Number.isFinite(this.ageMs()) && this.ageMs() < 48 * 3600000;
  }

  protected isNew(): boolean {
    return Number.isFinite(this.ageMs()) && this.ageMs() < 7 * 86400000;
  }

  protected age(): string {
    if (!Number.isFinite(this.ageMs()) || this.ageMs() < 0) return 'Fresh';
    const h = Math.floor(this.ageMs() / 3600000);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  protected intentVerdict(): string | null {
    const hay = `${str(this.prospect['importanceOfPassiveIncome'])} ${str(this.prospect['primaryOnlineBusinessMotivation'])}`.toLowerCase();
    if (!hay.trim()) return null;
    if (/(very|extremely|highly|desperate|must)/.test(hay)) return 'High intent — this lead says it matters a lot';
    if (/(somewhat|moderate|interested|curious|open)/.test(hay)) return 'Warm — showing real interest';
    return null;
  }

  protected groups = computed(() => {
    const pick = (rows: Array<[string, unknown]>): AnswerRow[] =>
      rows
        .map(([label, raw]) => ({
          label,
          value: Array.isArray(raw) ? raw.map((x) => str(x)).filter(Boolean).join(', ') : str(raw).trim(),
        }))
        .filter((r) => !!r.value);
    const p = this.prospect;
    return [
      {
        title: 'About',
        rows: pick([
          ['Age range', p['ageRange']],
          ['Hangs out on', p['socialMedia']],
          ['Employment', p['employedStatus']],
          ['Country', p['country']],
        ]),
      },
      {
        title: 'Intent',
        rows: pick([
          ['Passive income matters', p['importanceOfPassiveIncome']],
          ['Motivation', p['primaryOnlineBusinessMotivation']],
          ['Buys online', p['onlinePurchaseSchedule']],
          ['Time to dedicate', p['onlineBusinessTimeDedication']],
          ['Tech comfort', p['comfortWithTech']],
        ]),
      },
      {
        title: 'Trail',
        rows: pick([
          ['Referred by', p['referral'] ?? p['referralCode']],
          ['Visited', p['createdAt'] ? new Date(str(p['createdAt'])).toLocaleString() : ''],
        ]),
      },
    ].filter((g) => g.rows.length > 0);
  });

  protected claim(): void {
    this.dialogRef.close({ claim: str(this.prospect['_id']) });
  }
}

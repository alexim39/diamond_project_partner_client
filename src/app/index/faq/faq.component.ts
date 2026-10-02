import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
selector: 'async-index-faq',
imports: [MatButtonModule, RouterModule],
template: `
<section class="faq" aria-label="Questions">
  <p class="eyebrow">/ HONEST ANSWERS</p>
  <h2>Before you sign in</h2>
  <div class="list">
    <details open>
      <summary>Who is this platform for?</summary>
      <p>Registered Diamond Project partners and invited prospects holding a reservation code. The public opportunity site lives separately.</p>
    </details>
    <details>
      <summary>I don’t have a reservation code. What now?</summary>
      <p>Ask the partner who invited you for their code — accounts link to uplines automatically at signup. Without a code you can still explore the public site.</p>
    </details>
    <details>
      <summary>What does it cost?</summary>
      <p>The platform itself is your business workspace. Products, maintenance and ad budgets are handled transparently in your wallet with full histories.</p>
    </details>
    <details>
      <summary>How do I grow here?</summary>
      <p>Learn (IPO → QSG → SMO), get confirmed, work your pipeline daily, and coach your downline. Your dashboard always shows the next move.</p>
    </details>
  </div>
  <a mat-button routerLink="partner/signup" (click)="scrollToTop()">Create account →</a>
</section>
`,
changeDetection: ChangeDetectionStrategy.Eager,
styles: [`
.faq { padding: 3em 1.25em; max-width: 760px; margin: 0 auto; text-align: center; }
.eyebrow { color: var(--dp-gold-ink); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.15em; margin: 0; }
.faq h2 { margin: 0.3em 0 1em; font-size: clamp(1.5rem, 3.5vw, 2.1rem); }
.list { display: flex; flex-direction: column; gap: 0.6em; text-align: left; }
details { background: var(--dp-surface); border: 1px solid var(--dp-line); border-radius: var(--dp-radius, 10px); padding: 0.9em 1.1em; }
summary { font-weight: 700; cursor: pointer; min-height: 44px; display: flex; align-items: center; }
details p { margin: 0.5em 0 0; color: var(--dp-muted); font-size: 0.92rem; line-height: 1.6; }
a[mat-button] { min-height: 44px; margin-top: 1em; color: var(--dp-gold-ink); font-weight: 700; }
`],
})
export class FaqComponent {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

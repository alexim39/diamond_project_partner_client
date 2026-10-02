import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
selector: 'async-banner',
imports: [MatButtonModule, MatIconModule, RouterModule],
template: `

<div class="hero">
  <div class="hero-inner">
    <p class="eyebrow">Diamond Project · Partners Platform</p>
    <h1>Run your entire Diamond business from one place</h1>
    <p class="sub">
      Prospects, team, training, community and insights — the operating
      system for partners building from Prospect to G&nbsp;Leader.
    </p>
    <div class="cta-row">
      <a mat-flat-button color="primary" routerLink="partner/signin" (click)="scrollToTop()">Sign in</a>
      <a mat-stroked-button routerLink="partner/signup" (click)="scrollToTop()">Create account</a>
    </div>
    <p class="hint">New here? You need a reservation code from your inviter to sign up.</p>
    <div class="trust">
      <span><mat-icon>person_search</mat-icon> Prospect pipeline</span>
      <span><mat-icon>groups</mat-icon> Team coaching</span>
      <span><mat-icon>school</mat-icon> IPO · QSG · SMO</span>
      <span><mat-icon>forum</mat-icon> Community</span>
    </div>
  </div>
</div>

`,
changeDetection: ChangeDetectionStrategy.Eager,
styles: `

.hero {
  background:
    radial-gradient(700px 420px at 50% 0%, rgba(169,127,44,0.18), rgba(17,17,17,0) 70%),
    var(--dp-sidenav, #111111);
  color: var(--dp-sidenav-text, #f3ecdd);
  padding: 4em 1.25em 3em;
  text-align: center;
}
.hero-inner {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
}
.eyebrow {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--dp-nav-icon, #d9b36a);
}
.hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5.5vw, 3.25rem);
  line-height: 1.12;
  letter-spacing: -0.01em;
}
.sub {
  margin: 0;
  max-width: 38em;
  color: var(--dp-sidenav-text, #f3ecdd);
  opacity: 0.82;
  font-size: 1.05rem;
  line-height: 1.6;
}
.cta-row {
  display: flex;
  gap: 0.75em;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5em;
}
.cta-row a { min-height: 48px; }
a[mat-stroked-button] { border-color: var(--dp-nav-icon, #d9b36a); color: var(--dp-sidenav-text, #f3ecdd); }
.hint { margin: 0; font-size: 0.85em; opacity: 0.7; }
.trust {
  display: flex;
  gap: 1.25em;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1em;
  font-size: 0.88em;
  opacity: 0.9;
}
.trust span { display: inline-flex; align-items: center; gap: 0.35em; }
.trust mat-icon { font-size: 18px; height: 18px; width: 18px; color: var(--dp-nav-icon, #d9b36a); }

`
})
export class BannerComponent {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

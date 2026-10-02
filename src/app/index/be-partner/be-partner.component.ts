import {Component, ChangeDetectionStrategy} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule } from '@angular/router';


@Component({
selector: 'async-be-partner',
template: `
  <section class="final" aria-label="Get started">
    <div class="final-card">
      <p class="eyebrow">/ YOUR MOVE</p>
      <h2>Your business, one login away.</h2>
      <p>Sign in to work today’s pipeline, coach your team and track your numbers — or create your account with your inviter’s code.</p>
      <div class="cta-row">
        <a mat-flat-button color="primary" routerLink="partner/signin" (click)="scrollToTop()">Sign in</a>
        <a mat-stroked-button routerLink="partner/signup" (click)="scrollToTop()">Create account</a>
      </div>
      <p class="fine">No code yet? <a href="https://diamondproject.c21fg.online/" target="_blank" rel="noopener">Explore the public Diamond Project site</a> first.</p>
    </div>
  </section>
  `,
styles: [`
  .final { padding: 3em 1.25em 3.5em; }
  .final-card {
    max-width: 860px; margin: 0 auto; text-align: center;
    background: var(--dp-sidenav, #111111); color: var(--dp-sidenav-text, #f3ecdd);
    border: 1px solid var(--dp-gold, #a97f2c); border-radius: 18px; padding: 2.5em 1.5em;
  }
  .eyebrow { color: var(--dp-nav-icon, #d9b36a); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.15em; margin: 0; }
  .final-card h2 { margin: 0.4em 0 0.5em; font-size: clamp(1.6rem, 4vw, 2.4rem); }
  .final-card p { opacity: 0.85; max-width: 36em; margin: 0 auto 1.25em; line-height: 1.6; }
  .cta-row { display: flex; gap: 0.75em; justify-content: center; flex-wrap: wrap; }
  .cta-row a { min-height: 48px; }
  a[mat-stroked-button] { border-color: var(--dp-nav-icon, #d9b36a); color: var(--dp-sidenav-text, #f3ecdd); }
  .fine { font-size: 0.85em; opacity: 0.75; margin: 1.25em auto 0; }
  .fine a { color: var(--dp-nav-icon, #d9b36a); }
  `],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatButtonModule, MatIconModule, RouterModule]
})
export class BePartnerComponent {
   // scroll to top when clicked
   scrollToTop() {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }
}

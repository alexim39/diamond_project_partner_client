import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PartnerAuthService, PartnerSignInInterface } from '../auth.service';
import Swal from 'sweetalert2';

import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * @title Partner password reset
 */
@Component({
selector: 'async-partner-signin',
providers: [PartnerAuthService],
imports: [MatButtonModule, MatDividerModule, MatProgressBarModule, MatIconModule, ReactiveFormsModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
  template: `

<div class="page">
  <div class="login-panel dp-card">
    <a class="back" routerLink="/" (click)="scrollToTop()">← Back to home</a>
    <p class="eyebrow">Diamond Project · Partners</p>
    <h1>Reset password</h1>
    <p class="sub">Enter your account email — if it exists, a reset link is on its way (expires in 60 minutes).</p>
    <form [formGroup]="signInForm" (submit)="onSubmit()">

      <mat-form-field appearance="outline">
        <mat-label>Email address</mat-label>
        <input matInput type="email" formControlName="email" autocomplete="email">
        @if (signInForm.get('email')?.hasError('email') ) {
          <mat-error>
            Email is invalid
          </mat-error>
        }
        @if (signInForm.get('email')?.hasError('required') ) {
          <mat-error>
            Email is required
          </mat-error>
        }
      </mat-form-field>

      <button mat-flat-button color="primary">Send reset link</button>

    </form>

    <p class="alt">
      <a routerLink="../../partner/signin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Return to login?</a>
    </p>

    <div class="line"></div>

    <p class="alt">
      Not a Diamond Project partner yet? <a routerLink="../../partner/signup" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Sign up</a>
    </p>
  </div>
</div>

  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`

.page {
  background: var(--dp-paper);
  display: flex;
  justify-content: center;
  padding: 3em 1em 4em;
  .login-panel {
    width: min(440px, 100%);
    padding: 2em 1.75em;
    display: flex;
    flex-direction: column;
    text-align: center;
    .back {
      align-self: flex-start;
      text-decoration: none;
      color: var(--dp-gold-ink);
      font-weight: 700;
      font-size: 0.9em;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
    }
    .eyebrow {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dp-gold-ink);
      margin: 0.5em 0 0;
    }
    h1 { margin: 0.3em 0 0.2em; font-size: 1.9rem; }
    .sub { margin: 0 0 1.25em; color: var(--dp-muted); font-size: 0.95rem; line-height: 1.6; }
    form {
      display: flex;
      flex-direction: column;
      button { min-height: 48px; margin-top: 0.5em; }
    }
    .alt {
      margin: 1.25em 0 0;
      a {
        text-decoration: none;
        color: var(--dp-gold-ink);
        font-weight: 700;
        min-height: 44px;
        display: inline-flex;
        align-items: center;
      }
    }
    .line {
      border-top: 1px solid var(--dp-line);
      margin: 1.25em 0 0;
    }
  }
}
  `]
})
export class PartnerForgotPasswordComponent implements OnInit, OnDestroy {

  signInForm: FormGroup = new FormGroup({}); // Assigning a default value
  subscriptions: Array<Subscription> = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private partnerSignInService: PartnerAuthService
  ) { }

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.email, Validators.required]],
    });
  }

  onSubmit(): void {

    // Mark all form controls as touched to trigger the display of error messages
    this.markAllAsTouched();

    if (this.signInForm.valid) {
      // v1 request — always 200 (anti-enumeration)
     const formData: PartnerSignInInterface = this.signInForm.value;
      this.subscriptions.push(
        this.partnerSignInService.resetPassword(formData).subscribe({
          next: (res: any) => {
            Swal.fire({
              position: 'bottom',
              icon: 'success',
              text: res?.message ?? 'If an account exists for that email, a reset link is on its way. It expires in 60 minutes.',
              showConfirmButton: true,
              confirmButtonColor: '#ffab40',
            });
            this.signInForm.reset();
          },





          error: (error: any) => {
            const serverMessage: string | undefined = error?.error?.message;
            Swal.fire({
              position: 'bottom',
              icon: 'error',
              text: serverMessage ?? 'Could not send the reset link — check the email and try again.',
              showConfirmButton: false,
              timer: 4000
            });
          }
        })
      )
    }
  }

  // Helper method to mark all form controls as touched
  private markAllAsTouched() {
    Object.keys(this.signInForm.controls).forEach(controlName => {
      this.signInForm.get(controlName)?.markAsTouched();
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


}
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { SigninRequest } from '../../core/auth/auth.models';
import { ApiError } from '../../core/http/api-error';

/**
 * @title Partner signin
 *
 * Modernized: OnPush + signals, block control flow, auto-cleanup via
 * `takeUntilDestroyed`, fully typed. Session is the backend httpOnly
 * cookie — nothing is written to `localStorage` (legacy stored the
 * response object there, i.e. the string `"[object Object]"`).
 */
@Component({
  selector: 'async-partner-signin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="login-panel dp-card">
        <a class="back" routerLink="/" (click)="scrollTop()">← Back to home</a>
        <p class="eyebrow">Diamond Project · Partners</p>
        <h1>Welcome back</h1>
        <p class="sub">Sign in to work your pipeline, coach your team and track your numbers.</p>
        <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline">
            <mat-label>Email address</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (email?.hasError('email') && email?.touched) {
              <mat-error>Email is invalid</mat-error>
            }
            @if (email?.hasError('required') && email?.touched) {
              <mat-error>Email is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Enter your password</mat-label>
            <input matInput [type]="hide() ? 'password' : 'text'" formControlName="password" autocomplete="current-password" />
            @if (password?.hasError('required') && password?.touched) {
              <mat-error>Password is required</mat-error>
            }
            <button mat-icon-button matSuffix type="button" (click)="hide.set(!hide())" [attr.aria-label]="hide() ? 'Show password' : 'Hide password'" [attr.aria-pressed]="hide()">
              <mat-icon>{{ hide() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (serverError()) {
            <p class="server-error" role="alert">{{ serverError() }}</p>
          }

          <button mat-flat-button color="primary" type="submit" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="alt">
          <a routerLink="../../partner/forgot-password" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Forgot password?</a>
        </p>

        <div class="line"></div>

        <p class="alt">
          Not a Diamond Project partner yet?
          <a routerLink="../../partner/signup" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      background: var(--dp-paper);
      display: flex;
      justify-content: center;
      padding: 3em 1em 4em;
    }
    .login-panel {
      width: min(440px, 100%);
      padding: 2em 1.75em;
      display: flex;
      flex-direction: column;
      text-align: center;
    }
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
      margin: 0.5em 0 0;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--dp-gold-ink);
    }
    h1 { margin: 0.3em 0 0.2em; font-size: 1.9rem; }
    .sub { margin: 0 0 1.25em; color: var(--dp-muted); font-size: 0.95rem; line-height: 1.6; }
    form { display: flex; flex-direction: column; gap: 0.25em; }
    form button[type="submit"] { min-height: 48px; margin-top: 0.5em; }
    .server-error { color: var(--dp-error); margin: 0.5em 0; }
    .alt { margin: 1.25em 0 0; }
    .alt a { text-decoration: none; color: var(--dp-gold-ink); font-weight: 700; min-height: 44px; display: inline-flex; align-items: center; }
    .line { border-top: 1px solid var(--dp-line); margin: 1.25em 0 0; }
  `],
})
export class PartnerSigninComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hide = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly signInForm = this.fb.nonNullable.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', Validators.required],
  });

  protected get email() {
    return this.signInForm.get('email');
  }

  protected get password() {
    return this.signInForm.get('password');
  }

  protected scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected onSubmit(): void {
    if (this.isSubmitting()) return;
    this.signInForm.markAllAsTouched();
    if (this.signInForm.invalid) return;

    this.isSubmitting.set(true);
    this.serverError.set(null);

    const credentials = this.signInForm.getRawValue() as SigninRequest;
    this.authService
      .signin(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigateByUrl('dashboard'),
        error: (error: ApiError) => {
          this.isSubmitting.set(false);
          this.serverError.set(error.message);
        },
      });
  }
}

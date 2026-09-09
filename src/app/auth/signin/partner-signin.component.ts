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
      <div class="login-panel">
        <h1>Partner Sign in</h1>
        <h2>Log in into your account</h2>
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
            <button mat-icon-button matSuffix type="button" (click)="hide.set(!hide())" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hide()">
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

        <p>
          <a routerLink="../../partner/forgot-password" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Forgot password?</a>
        </p>

        <div class="line"></div>

        <p>
          Not a Diamond Project partner yet?
          <a routerLink="../../partner/signup" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Sign up</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      background: #eee;
      display: flex;
      justify-content: center;
      text-align: center;
      padding-top: 2em;
      height: 80%;
      .login-panel {
        display: flex;
        flex-direction: column;
        h2 {
          font-size: 1em;
          color: #ffab40;
        }
        form {
          display: flex;
          flex-direction: column;
        }
        .server-error {
          color: #d32f2f;
          margin: 0 0 1em;
        }
        p {
          margin: 2em 0;
          a {
            text-decoration: none;
            color: #ffab40;
          }
        }
        .line {
          border: 1px solid #ccc;
          margin: 1em 0;
        }
      }
    }
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

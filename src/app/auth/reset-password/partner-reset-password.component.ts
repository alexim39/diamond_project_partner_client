import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PartnerAuthService } from '../auth.service';
import { ApiError } from '../../core/http/api-error';
import Swal from 'sweetalert2';

/**
 * @title Set a new password — consumes the emailed reset token.
 *
 * Token arrives as ?token= (v1 reset flow, 60-minute expiry, single-use).
 * No token → guidance back to forgot-password instead of a dead form.
 * Token-blind dark shells (no fixed-light panels), 44px targets, OnPush.
 */
@Component({
  selector: 'async-partner-reset-password',
  providers: [PartnerAuthService],
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="page">
      <div class="login-panel">
        <h1>Set a new password</h1>

        @if (!token()) {
          <p class="muted">This link is missing its reset token.</p>
          <p>
            <a routerLink="../forgot-password">Request a fresh reset link</a>
          </p>
        } @else {
          <h4>Choose a password of at least 6 characters</h4>
          <form [formGroup]="form" (submit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>New password</mat-label>
              <input matInput [type]="hide() ? 'password' : 'text'" formControlName="password" autocomplete="new-password" />
              <button mat-icon-button matSuffix type="button" (click)="hide.set(!hide())" [attr.aria-label]="hide() ? 'Show password' : 'Hide password'">
                <mat-icon>{{ hide() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>At least 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm password</mat-label>
              <input matInput [type]="hide() ? 'password' : 'text'" formControlName="confirm" autocomplete="new-password" />
              @if (form.hasError('mismatch') && form.get('confirm')?.touched) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>

            @if (submitting()) {
              <mat-progress-bar mode="indeterminate" class="progress-bar" />
            }

            <button mat-flat-button color="primary" [disabled]="form.invalid || submitting()">
              {{ submitting() ? 'Saving…' : 'Set password' }}
            </button>
          </form>
        }

        <p>
          <a routerLink="../signin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Return to login?</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      display: flex;
      justify-content: center;
      text-align: center;
      padding-top: 2em;
      min-height: 80%;
      .login-panel {
        display: flex;
        flex-direction: column;
        width: min(420px, 100%);
        padding: 0 1em;
        form {
          display: flex;
          flex-direction: column;
          .progress-bar {
            margin-bottom: 1em;
          }
        }
        .muted { color: var(--dp-muted); }
        p {
          margin: 2em 0;
          a {
            text-decoration: none;
            color: var(--dp-gold-ink);
          }
        }
      }
    }
  `],
})
export class PartnerResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly routes = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(PartnerAuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly hide = signal(true);
  protected readonly submitting = signal(false);
  protected readonly token = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      confirm: ['', [Validators.required]],
    },
    {
      validators: (group) =>
        group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true },
    },
  );

  ngOnInit(): void {
    this.routes.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.token.set(params.get('token')));
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    const token = this.token();
    if (this.form.invalid || !token || this.submitting()) return;
    this.submitting.set(true);
    this.authService
      .confirmResetPassword({ token, newPassword: String(this.form.get('password')?.value ?? '') })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.submitting.set(false);
          Swal.fire({
            position: 'bottom',
            icon: 'success',
            text: res?.message ?? 'Password updated — sign in with your new password.',
            showConfirmButton: true,
            confirmButtonColor: '#ffab40',
            confirmButtonText: 'Sign in now',
          }).then(() => {
            void this.router.navigateByUrl('partner/signin');
          });
        },
        error: (err: ApiError) => {
          this.submitting.set(false);
          Swal.fire({
            position: 'bottom',
            icon: 'error',
            text: err?.message ?? 'This link is invalid or expired — request a fresh one.',
            showConfirmButton: true,
            confirmButtonColor: '#ffab40',
          });
        },
      });
  }
}

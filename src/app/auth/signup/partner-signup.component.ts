import { Component, OnDestroy, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { userError } from '../../core/http/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { PartnerSignUpInterface } from '../auth.service';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReservationCodeDialogComponent } from './reservation-code.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { minDigitsValidator } from '../../_common/services/phone-number-checker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * @title Partner signup
 */
@Component({
    selector: 'async-partner-signup',
    imports: [MatButtonModule, MatDividerModule, MatTooltipModule, MatProgressBarModule, MatDialogModule, ReactiveFormsModule, MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
    templateUrl: 'partner-signup.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["partner-signup.component.scss", "partner-signup.mobile.scss"]
})
export class PartnerSignupComponent implements OnInit, OnDestroy {
  protected readonly hide = signal(true);
  protected readonly isSubmitting = signal(false);

  protected signUpForm: FormGroup = new FormGroup({});
  protected subscriptions: Array<Subscription> = [];

  readonly dialog = inject(MatDialog);

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly partnerSignUpService: AuthService
  ) { }

  ngOnInit(): void {
  this.signUpForm = this.fb.group({
    reservationCode: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(247[A-Za-z0-9\/]+|NR\d{6}|NI\d{6}|NV\d{6}|[A-Za-z]{2}[A-Za-z0-9]+)$/i)
      ]
    ],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{7,20}$/)]],
    email: ['', [Validators.email, Validators.required]],
    name: ['', Validators.required],
    surname: ['', Validators.required],
    password: ['', [Validators.required, minDigitsValidator(8)]],
  });
}

protected onSubmit(): void {
    if (this.isSubmitting()) return;
    this.markAllAsTouched();

    if (this.signUpForm.valid) {
      this.isSubmitting.set(true);
      const formData: PartnerSignUpInterface = this.signUpForm.value;
      this.subscriptions.push(
        this.partnerSignUpService.signup(formData).pipe(takeUntilDestroyed()).subscribe({
          next: (res) => {
            this.isSubmitting.set(false);
            const response = res as { message?: string };
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: response.message ?? 'Registration successful',
              showConfirmButton: true,
              timer: 10000,
              confirmButtonColor: "#ffab40",
              confirmButtonText: "Sign in Now",
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('partner/signin');
              }
            });
          },
          error: (error: unknown) => {
            this.isSubmitting.set(false);
            Swal.fire({
              position: "bottom",
              icon: 'error',
              text: userError(error),
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
    Object.keys(this.signUpForm.controls).forEach(controlName => {
      this.signUpForm.get(controlName)?.markAsTouched();
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription =>  subscription.unsubscribe());
  }

  // Method to scroll to the top of the page
  protected scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(ReservationCodeDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
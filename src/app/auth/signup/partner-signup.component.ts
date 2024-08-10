import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PartnerSignUpData } from '../auth.interface';
import Swal from 'sweetalert2';
import { PartnerAuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReservationCodeDialogComponent } from './reservation-code.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { minDigitsValidator } from '../../_common/services/phone-number-checker';

/**
 * @title Partner signup
 */
@Component({
  selector: 'async-partner-signup',
  standalone: true,
  providers: [PartnerAuthService],
  imports: [MatButtonModule, MatDividerModule, MatTooltipModule, MatProgressBarModule, MatDialogModule, ReactiveFormsModule, CommonModule, MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
  templateUrl: 'partner-signup.component.html',
  styleUrls: ["partner-signup.component.scss", "partner-signup.mobile.scss"]
})
export class PartnerSignupComponent implements OnInit, OnDestroy {
  hide = true;

  signUpForm: FormGroup = new FormGroup({}); // Assigning a default value
  subscriptions: Array<Subscription> = [];
  isSpinning = false;

  readonly dialog = inject(MatDialog);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private partnerSignUpService: PartnerAuthService
  ) { }

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      reservationCode: ['', Validators.required],
      phone: ['', [Validators.required, ]],
      email: ['', [Validators.email, Validators.required]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      password: ['', [Validators.required, minDigitsValidator(6)]],
    });
  }

  onSubmit(): void {
    this.isSpinning = true;

    // Mark all form controls as touched to trigger the display of error messages
    this.markAllAsTouched();

    if (this.signUpForm.valid) {
      // Send the form value to your Node.js backend
      const formData: PartnerSignUpData = this.signUpForm.value;
      this.subscriptions.push(
        this.partnerSignUpService.signup(formData).subscribe((res: any) => {

          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Thank you for partnering with us. We will support you grow your business online',
            showConfirmButton: true,
            timer: 15000,
            confirmButtonColor: "#ffab40",
            confirmButtonText: "Sign in Now",
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigateByUrl('partner/signin');
            }
          });
          this.isSpinning = false;

        }, (error: any) => {
          console.log(error)
          this.isSpinning = false;
          if (error.code == 400) {
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'This reservation code does not exist',
              showConfirmButton: false,
              timer: 4000
            });
          } else if (error.code == 401) {
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'This reservation code has been used',
              showConfirmButton: false,
              timer: 4000
            });
          } else {

            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please try again',
              showConfirmButton: false,
              timer: 4000
            })
          };
        })
      )
    } else {
      this.isSpinning = false;
    }

  }

  // Helper method to mark all form controls as touched
  private markAllAsTouched() {
    Object.keys(this.signUpForm.controls).forEach(controlName => {
      this.signUpForm.get(controlName)?.markAsTouched();
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  // Method to scroll to the top of the page
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    this.dialog.open(ReservationCodeDialogComponent, {
      //width: '50em',
      enterAnimationDuration,
      exitAnimationDuration,
    });
  }
}
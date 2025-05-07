import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title Partner signin
 */
@Component({
selector: 'async-partner-signin',
providers: [PartnerAuthService],
imports: [MatButtonModule, CommonModule, MatDividerModule, MatProgressBarModule, MatIconModule, ReactiveFormsModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
template: `

<div class="page">
    <div class="login-panel">
      <h1>Partner Sign in</h1>
      <h2>Log in into your account</h2>
      <form [formGroup]="signInForm" (submit)="onSubmit()">

        <mat-form-field appearance="outline">
          <mat-label>Email address</mat-label>
          <input matInput type="email" formControlName="email">
          <mat-error *ngIf="signInForm.get('email')?.hasError('email') ">
            Email is invalid
          </mat-error>
          <mat-error *ngIf="signInForm.get('email')?.hasError('required') ">
            Email is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Enter your password</mat-label>
          <input matInput [type]="hide ? 'password' : 'text'" formControlName="password">
          <mat-error *ngIf="signInForm.get('password')?.hasError('password') ">
            Password is invalid
          </mat-error>
          <mat-error *ngIf="signInForm.get('password')?.hasError('required') ">
            Password is required
          </mat-error>
          <a mat-icon-button matSuffix (click)="hide = !hide" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hide">
            <mat-icon>{{hide ? 'visibility_off' : 'visibility'}}</mat-icon>
          </a>
        </mat-form-field>


        <button mat-flat-button color="primary">Sign in</button>

      </form>

      <p>
        <a routerLink="../../partner/forgot-password" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Forgot password?</a>
      </p>

      <div class="line"></div>

      <p>
        Not a Diamond Project partner yet? <a routerLink="../../partner/signup" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Sign up</a>
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
        .progress-bar {
          margin-bottom: 1em;
        }
        
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

`]
})
export class PartnerSigninComponent implements OnInit, OnDestroy {
  hide = true;

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
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {

    // Mark all form controls as touched to trigger the display of error messages
    this.markAllAsTouched();

    if (this.signInForm.valid) {
      // Send the form value to your Node.js backend
     const formData: PartnerSignInInterface = this.signInForm.value;
      this.subscriptions.push(
        this.partnerSignInService.siginin(formData).subscribe( {

          next: (response) => {
            localStorage.setItem('authToken', response); // Save token to localStorage
            this.router.navigateByUrl('dashboard');
          },
          error: (error: HttpErrorResponse) => {
            let errorMessage = 'Server error occurred, please try again.'; // default error message.
            if (error.error && error.error.message) {
              errorMessage = error.error.message; // Use backend's error message if available.
            }
            Swal.fire({
              position: "bottom",
              icon: 'error',
              text: errorMessage,
              showConfirmButton: false,
              timer: 4000
            });
          }

          
        /*   localStorage.setItem('authToken', res); // Save token to localStorage
          this.router.navigateByUrl('dashboard');
        }, error => {
          if (error.code == 404) {// user not found
            Swal.fire({
              position: 'bottom',
              icon: 'warning',
              text: "Check your email or password",
              showConfirmButton: false,
              timer: 4000
            });
          }
          if (error.code == 400) {// invalid credentail
            Swal.fire({
              position: 'bottom',
              icon: 'warning',
              text: "Check your email or password",
              showConfirmButton: false,
              timer: 4000
            });
          } */
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


}
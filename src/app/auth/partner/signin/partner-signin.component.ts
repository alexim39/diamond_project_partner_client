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
import { PartnerAuthService } from '../partner-auth.service';
import Swal from 'sweetalert2';
import { PartnerSignInData } from '../partner-auth.interface';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * @title Partner signin
 */
@Component({
    selector: 'async-partner-signin',
    standalone: true,
    providers: [PartnerAuthService],
    imports: [MatButtonModule, CommonModule, MatDividerModule, MatProgressBarModule, MatIconModule, ReactiveFormsModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
    templateUrl: 'partner-signin.component.html' ,
    styleUrls: ['partner-signin.component.scss']
})
export class PartnerSigninComponent implements OnInit, OnDestroy {
  hide = true;

  signInForm: FormGroup = new FormGroup({}); // Assigning a default value
  subscriptions: Array<Subscription> = [];
  isSpinning = false;

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
    this.isSpinning = true;

    // Mark all form controls as touched to trigger the display of error messages
    this.markAllAsTouched();

    if (this.signInForm.valid) {
      // Send the form value to your Node.js backend
     const formData: PartnerSignInData = this.signInForm.value;
      this.subscriptions.push(
        this.partnerSignInService.siginin(formData).subscribe((res: any) => {
          this.isSpinning = false;
          this.router.navigateByUrl('dashboard');
        }, error => {
          this.isSpinning = false;
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
          }
        })
      )
    } else {
     this.isSpinning = false;
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
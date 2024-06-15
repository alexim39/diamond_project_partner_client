import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
/**
 * @title Partner signup
 */
@Component({
    selector: 'async-partner-signup',
    standalone: true,
    imports: [MatButtonModule, MatDividerModule, MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
    template: `
<div class="main-container">
  <div class="content">

    <div class="left-content">
      <div class="bold-text">Join Diamond Projecat and earn more</div>
      <div class="normal-text">
        As a Diamond Project partner, you can manage your business from one easy-to-use dashboard and grow your business online
      </div>
    </div>

    <div class="right-panel">
      <div class="panel-content">
        <form>
          <h2>Partner sign up</h2>

          <div class="names-field">
            <mat-form-field appearance="outline">
              <mat-label>Name</mat-label>
              <input matInput>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Surname</mat-label>
              <input matInput>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Reservation Code</mat-label>
            <input matInput type="reservationCode">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Phone Number</mat-label>
            <input matInput type="tel">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput type="email">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Enter your password</mat-label>
            <input matInput [type]="hide ? 'password' : 'text'">
            <button mat-icon-button matSuffix (click)="hide = !hide" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hide">
              <mat-icon>{{hide ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-flat-button color="primary">Sign up</button>
        </form>

        <p>Already have an account? <a routerLink="../../../auth/partner" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Sign in</a></p>

        <p>By Signing up, you agree to our <a href="">Terms of Service</a> and <a href=""> Privacy policy</a></p>

      </div>
    </div>
  </div>
</div>

<div class="benefit">
  <h1>Why partner with us?</h1>
  <p class="sub-title">Bonnyride is trusted by partners from across the States of Nigeria. We’re known for:</p>

  <div class="benefit-container">

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-dollar" aria-hidden="true"></div>
      </div>
      <h3>String, stable earnings</h3>
      <p>
        Reliable returns with consistent demand.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-eye" aria-hidden="true"></div>
      </div>
      <h3>Complete transparency</h3>
      <p>
        A sleek, modern portal to manage all aspects of your business.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-support" aria-hidden="true"></div>
      </div>
      <h3>Great customer support</h3>
      <p>
        Short response times for business-related queries.
      </p>
    </div>

  </div>
</div>

<div class="benefit">
  <div class="car-portal">
    <h1>How our partner portal works</h1>
    <p class="sub-title">
    Operate your business in real-time with the most extensive and easy to use cab management software available on the market today.
    </p>
  </div>
</div>

<div class="step-container">
  <div class="step-content">
    <h1>Boost your cab earning with Bonnyride</h1>
    <ol>
      <li>
        <h2>Sign up</h2>
        <p>It takes just 2 minutes to register a partner account.</p>
      </li>
      <li>
        <h2>Get approved</h2>
        <p>Add car details such as vehicles and drivers while we activate your account.</p>
      </li>
      <li>
        <h2>Start earning</h2>
        <p>Once approved, your car is ready to start earning on the roads.</p>
      </li>
    </ol>

    <a mat-raised-button color="primary" (click)="scrollToTop()">Sign up now</a>
  </div>
</div>
`,
styleUrls: ["partner-signup.component.scss", "partner-signup.mobile.scss"]
})
export class PartnerSignupComponent {
  hide = true;

  // Method to scroll to the top of the page
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
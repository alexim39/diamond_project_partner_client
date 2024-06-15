import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';

/**
 * @title Customer signup
 */
@Component({
    selector: 'async-customer-signup',
    standalone: true,
    imports: [MatButtonModule, MatDividerModule, MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
    template: `
      <div class="main-container">
        <div class="content">

          <div class="left-content">
            <div class="bold-text">Experience Unmatched Comfort And Sign Up with Bonnyride</div>
            <div class="normal-text">
              As a valued Bonnyride customer, enjoy the convenience of managing bookings and more through our user-friendly dashboard. Ensure a comfortable journey every time
            </div>
          </div>

          <div class="right-panel">
            <div class="panel-content">
              <form>
              <h2>Customer sign up</h2>

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
                <mat-label>Phone Number</mat-label>
                <input matInput type="tel">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Enter your password</mat-label>
                <input matInput [type]="hide ? 'password' : 'text'">
                <button mat-icon-button matSuffix (click)="hide = !hide" [attr.aria-label]="'Hide password'" [attr.aria-pressed]="hide">
                  <mat-icon>{{hide ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
              </mat-form-field>

              <button mat-flat-button color="primary">Sign in</button>
              </form>

              <p>Already have an account? <a routerLink="../../../auth/customer" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Sign in</a></p>

              <p>By Signing up, you agree to our <a href="">Terms of Service</a> and <a href=""> Privacy policy</a></p>

            </div>
          </div>
        </div>
      </div>

<div class="benefit">
  <h1>Why use Bonnyride?</h1>
  <div class="sub-title">
    <p>
    Whether you're traveling a short or long distance within Bonny Island, BonnyRide ensures your journey is guaranteed to be comfortable. <br>
    BonnyRide stands ready to serve you around the clock, 24/7, ensuring that we are available whenever you need reliable transportation for your journey.
    </p>
  </div>



  <div class="benefit-container">

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-coffee" aria-hidden="true"></div>
      </div>
      <h3>Convenience</h3>
      <p>
      We provide a convenient way to book a ride with just a few taps on your smartphone, tablet or destop computer. 
      You can request a ride from anywhere and at any time, making it extremely convenient for spontaneous trips or when public transportation is not readily available.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-universal-access" aria-hidden="true"></div>
      </div>
      <h3>Accessibility</h3>
      <p>
      We are accessible at all times, whether you own a car or not.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-universal-access" aria-hidden="true"></div>
      </div>
      <h3>Cost-Efficiency</h3>
      <p>
      Our fare prices are significantly lower when compared to those of a standard taxi 
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-clock-o" aria-hidden="true"></div>
      </div>
      <h3>Time Efficiency</h3>
      <p>
        Recognizing the value of your time, we prioritize swift service, ensuring to take the most efficient route to promptly get you to your destination.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-life-saver" aria-hidden="true"></div>
      </div>
      <h3>Safety Features</h3>
      <p>
      Bonnyride platforms incorporate safety features such as driver ratings, trip tracking, and in-app emergency assistance. 
      These features contribute to a safer and more secure transportation experience.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-bus" aria-hidden="true"></div>
      </div>
      <h3>Cashless Transaction</h3>
      <p>
      Payment for rides can be typically cashless or with cash, with transactions handled through the app. 
      The need for physical currency is limited as this provides a seamless payment process.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-automobile" aria-hidden="true"></div>
      </div>
      <h3>Variety of Vehicle Options</h3>
      <p>
      You can choose from a variety of vehicle options based on your preferences and needs. 
      Whether it's a standard car, a larger vehicle for groups, or a luxury option, we offer flexibility in choosing the type of ride.
      </p>
    </div>

    <div class="benefit-content">
      <div class="fa-icon">
        <div class="fa fa-compass" aria-hidden="true"></div>
      </div>
      <h3>Real-Time Tracking</h3>
      <p>
      We offer real-time tracking, allowing our customers to monitor the location of their ride and estimated time of arrival. 
      This feature enhances safety and provides peace of mind.
      </p>
    </div>

  </div>





<div class="step-container">
  <div class="step-content">
    <h1>Book Bonnyride with just a simple steps</h1>
    <ol>
      <li>
        <h2>Sign up</h2>
        <p>It takes just 2 minutes to register a customer account.</p>
      </li>
      <li>
        <h2>Book a ride</h2>
        <p>Use our ride booking feature to order instant ride or book a ride for later use</p>
      </li>
      <li>
        <h2>Repeat a book</h2>
        <p>Reorder or rebook and enjoy a comfortable ride with us.</p>
      </li>
    </ol>

    <a mat-raised-button color="accent" (click)="scrollToTop()">Sign up now</a>
  </div>
</div>
  `,
  styleUrls: ['customer-signup.component.scss', 'customer-signup.mobile.scss']
})
export class CustomerSignupComponent {
  hide = true;

  // Method to scroll to the top of the page
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
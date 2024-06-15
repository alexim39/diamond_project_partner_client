import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';

/**
 * @title Customer signin
 */
@Component({
    selector: 'async-customer-signin',
    standalone: true,
    imports: [MatButtonModule, MatDividerModule, MatIconModule, MatExpansionModule, MatFormFieldModule, MatInputModule, RouterModule],
    template: `
    
    <div class="page">
      <div class="login-panel">
        <h1>Customer Sign in</h1>
        <h2>Log in into your account</h2>
        <form>

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

        <p>
          <a href="">Forgot password?</a>
        </p>

        <div class="line"></div>

        <p>
          Not a Bonnyride customer yet? <a routerLink="../../../auth/customer/signup" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Sign up</a>
        </p>
      </div>
    </div>

  `,
    styles: [`
.page {
  //background: #eee;
  display: flex;
  justify-content: center;
  text-align: center;
  .login-panel {
    display: flex;
    flex-direction: column;
    h1 {
      //color: #ffab40;
    }
    h2 {
      font-size: 1em;
      color: #ffab40;
    }
    form {
      display: flex;
      flex-direction: column;
    }
    p {
      margin: 2em 0;
      font-family: cursive;
      a {
        text-decoration: none;
        color: #00838f;
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
export class CustomerSigninComponent {
  hide = true;
}
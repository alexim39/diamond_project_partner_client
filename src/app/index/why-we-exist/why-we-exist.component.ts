import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'async-index-why-we-exist',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatButtonModule,  MatFormFieldModule, MatInputModule, CommonModule],
  template: `
    <aside class="why-we-exist">
      <div>

        <span class="mark">
          <strong>Manage Your Business: </strong>You can manage, monitor and grow your business on our partners platform
          <!-- <div class="more">
            <a routerLink="cab-services" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Know more <i class="fa fa-angle-double-right"></i></a>
          </div> -->
        </span>

        <span class="mark">
          <strong>Run Your Business: </strong>Running your business is now a computer a smart phone away from you
          <!-- <div class="more">
            <a routerLink="courier-services" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Know more <i class="fa fa-angle-double-right"></i></a>
          </div> -->
        </span>

        <span>
          <strong>Grow Your Business: </strong>The platform will help you grow your business as you can reach out to new partners and stay connected with member partners
          <!-- <div class="more">
            <a routerLink="tow-services" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Know more <i class="fa fa-angle-double-right"></i></a>
          </div> -->
        </span>
      </div>


      <!-- <h1>We firmly believe that you can have a comfortable journey to your destination at any hour, whether it’s day or night.</h1> -->
      <h1>Manage, Run and Grow your business with our platform, any time and day</h1>

      <!-- <small>Use our flexible learning path, adjust your learning to suit your time  — all in one place. Open a free account in minutes and learn any time.</small> -->

      <a mat-flat-button color="primary" routerLink="auth/partner/signin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Sign In Now</a>
    </aside>
  `,
  styles: [`
  aside {
    padding: 3em 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #050111;
    div {
      margin: 1em;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .mark {
          border-right: 1px dotted #bbb;
          padding-right: 1em;
        }
      span {
        margin: 0.4em;
        color: #ffab40;
        font-family: Verdana;
        strong {
          display: block;
          margin-bottom: 0.5em;
        }
        .more {
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          a {
            font-size: 0.8em;
            color: #00838f;
            font-weight: bolder;
            text-decoration: none;
          }
        }
      }
    }
    h1 {
      font-weight: bolder;
      margin: 1em;
      color: #ad1457;
    }
    small {
      text-align: justify;
      margin: 0 1em;
    }
  }


/* Media Query for Mobile Responsiveness */
@media screen and (max-width: 600px) {
  aside {
    //padding: 1em;
    div {
      margin: 1em;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .mark {
        border-bottom: 1px dotted #bbb;
        border-right: 0px dotted #bbb;
        padding-bottom: 1em;
      }
    }
  }
}
  `],
})
export class WhyWeExistComponent implements OnInit{

  constructor() { }

  ngOnInit(): void {  }

   // scroll to top when clicked
   scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }



  ngOnDestroy() {}

}

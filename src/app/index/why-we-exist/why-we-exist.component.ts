import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'async-index-why-we-exist',
    imports: [RouterModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, CommonModule],
    template: `
    <aside class="why-we-exist">
      <div>

        <span class="mark">
          <strong>Manage Your Business: </strong>Easily manage your team, track performance, and ensure everyone stays on the same page. Say hello to organized success as all activities are now automated and easy to tracked.
          <!-- <div class="more">
            <a routerLink="cab-services" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Know more <i class="fa fa-angle-double-right"></i></a>
          </div> -->
        </span>

        <span>
          <strong>Grow Your Business: </strong>Grow your network efficiently, connect with new prospects, nurture relationships, stay connected with your partners and members. Watch your network flourish like never before. 
          <!-- <div class="more">
            <a routerLink="tow-services" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Know more <i class="fa fa-angle-double-right"></i></a>
          </div> -->
        </span>

        <span class="mark">
          <strong>Promote Your Business: </strong>Create impactful marketing campaigns, reach a wider audience, stand out in the competitive market and drive your business forward. Running your business is now a smartphone or computer away.
          <!-- <div class="more">
            <a routerLink="courier-services" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Know more <i class="fa fa-angle-double-right"></i></a>
          </div> -->
        </span>

      </div>

     


      <!-- <h1>We firmly believe that you can have a comfortable journey to your destination at any hour, whether it’s day or night.</h1> -->
      <h1>Manage, Promote and Grow your business with Diamond Project Online Platform, any time and day</h1>

      <!-- <small>Use our flexible learning path, adjust your learning to suit your time  — all in one place. Open a free account in minutes and learn any time.</small> -->

      <a mat-flat-button color="primary" routerLink="partner/signin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Sign In Now</a>
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
          border-left: 1px dotted #bbb;
          padding-right: 1em;
          padding-left: 1em;
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
       /*  border-bottom: 1px dotted #bbb;
        border-right: 0px dotted #bbb;
        padding-bottom: 1em; */
       
      }
      span {
        margin-bottom: 2em;
      }
    }
  }
}
  `]
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

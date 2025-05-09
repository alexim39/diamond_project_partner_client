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
      <div class="features">

        <span class="mark">
          <strong>Manage Your Business: </strong>
          <p>
            Simplify team management and performance tracking for aligned, organized success. Automation makes tracking easy.
          </p>
        </span>

        <span>
          <strong>Grow Your Business: </strong>
          <p>
            Efficiently grow your network, connect with prospects, nurture relationships, and stay connected with partners/members. Watch your network grow.
          </p>
        </span>

        <span class="mark">
          <strong>Promote Your Business: </strong>
          <p>
          Drive business growth with impactful marketing, wider reach, and market differentiation – conveniently managed from your phone or computer.
          </p>
        </span>

      </div>

      <h1>Manage, Promote and Grow your business with Diamond Project Online Platform, any time and day</h1>

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
    .features {
      margin: 1em;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      strong {
        color:rgb(193, 112, 5);
      }
      p {
        line-height: 2em;
        width: 60%;
        text-align: justify;
        padding-left: 2em;
      }
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
      }
    }
    h1 {
      font-weight: bolder;
      margin: 3em;
      color:rgb(193, 112, 5);
    }

  }


/* Media Query for Mobile Responsiveness */
@media screen and (max-width: 600px) {
  aside {
    .features {
      margin: 1em;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      p {
        width: auto;
      }
     
      span {
        margin-bottom: 2em;
      }
    }
    h1 {
      width: 100%;
    }
  }
}
  `]
})
export class WhyWeExistComponent{

   // scroll to top when clicked
   scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}

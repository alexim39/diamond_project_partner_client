import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'async-logo',
    imports: [MatIconModule, RouterModule],
    template: `
    <a [routerLink]="['/']" [style.color]="color">
      <span>
        <img src="./img/logo.PNG">
        Diamond Project (Online) <span class="partners"> Partners</span>
      </span>
    </a>
  `,
    styles: [`
    a {
      text-decoration: none;
      span {
        display: flex;
        justify-content: center;
        font-family: "Audiowide", sans-serif;
        font-size: 0.9em;
        font-weight: bold;
        img {
          width: 1.3em;
          height: 1.3em;
          border-radius: 10%;
          margin-right: 1px;
        }
        .partners {
          color: gray;
          font-size: 0.6em;
          //font-family: Verdana;
          color: #ffab40;
          font-weight: bold;
        }
      }
    }

/* Media Query for Mobile Responsiveness */
@media screen and (max-width: 600px) {
  a {
    span {
      font-size: 16px;
      img {
        width: 1.3em;
        height: 1.3em;
      }
    }
  }
}
  `]
})
export class LogoComponent {
  
  @Input() color = '#050111';
  //@Input() marginTop = '0';
}

import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'async-logo',
    imports: [MatIconModule, RouterModule],
    template: `
    <a [routerLink]="['/']" [style.color]="color">
      <img src="./img/plogo.png">
    </a>
  `,
    styles: [`
    a {
      text-decoration: none;
      display: flex;
      margin-left: 3em;
      img {
        width: 10em;
        height: 2.5em;
        border-radius: 10%;
      }
    }

/* Media Query for Mobile Responsiveness */
@media screen and (max-width: 600px) {
  a {
    margin-left: 0;
    img {
        width: 8em;
        height: 2em;
        border-radius: 10%;
      }
  }
}
  `]
})
export class LogoComponent {
  
  @Input() color = '#050111';
  //@Input() marginTop = '0';
}

import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'async-logo',
  standalone: true,
  imports: [MatIconModule, RouterModule],
  template: `
    <a [routerLink]="['/']" [style.color]="color">
      <span>
        <img src="./img/logo.PNG">
        Diamond Project (Online) - Partners
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
        font-size: 20px;
        font-weight: bold;
        img {
          width: 1.3em;
          height: 1.3em;
          border-radius: 10%;
          margin-right: 1px;
        }
      }
    }
  `]
})
export class LogoComponent {
  
  @Input() color = '#050111';
  //@Input() marginTop = '0';
}

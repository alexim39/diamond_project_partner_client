import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'async-be-partner',
  template: `
  <div class="container">
    <div class="row">
        <div class="writeup">
            <p>Visit our home page to understand more about our business</p>
        </div>
        <div class="call">
            <a mat-flat-button href="http://diamondprojectonline.com" target="_blank">Know More, Join Us Now</a>
        </div>
    </div>
  </div>
  `,
  styles: [`
  .container {
    background: #eee;
    padding: 1em 0;
    .row {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .writeup {
            p {
                font-size: 1em;
                padding: 0 1em;
                font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            }
        }
    }
  }
  `],
  standalone: true,
  imports: [MatButtonModule,RouterModule ],
})
export class BePartnerComponent {
   // scroll to top when clicked
   scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
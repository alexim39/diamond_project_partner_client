import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { RouterModule } from '@angular/router';

/**
 * @title Page not found component
 */
@Component({
  selector: 'async-page-not-found',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterModule],
  styles: [`
* {
  padding: 0;
  margin: 0;
  outline: 0;
  color: #444;
  box-sizing: border-box;
  font-family: 'IBM Plex Sans', sans-serif;
}

.page_404{ 
    padding:40px 0; 
    font-family: 'Arvo', serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

  

.four_zero_four_bg{ 
    background-image: url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif);
    height: 400px;
    width: 45%;
    background-position: center;
    h1{
        font-size:80px; 
        text-align: center;
    }
 }
 

.contant_box_404{ 
    margin-top:-50px;
    text-align: center;
    h3{
        font-size:30px; 
    }
    p {
        padding: 1em 0;
    }
    button {
        padding: 1em;
    }
}


/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
    .contant_box_404{ 
        padding: 1em;
        h3 {
            font-family: Cursive;
            font-size:20px; 
        }
        p {
            padding: 1em 0;
        }
        button {
            padding: 1em;
        }
    }

}

`],
  template: `
<section class="page_404">
    <div class="four_zero_four_bg">
        <h1 class="text-center">404</h1>
    </div>

    <div class="contant_box_404">
        <h3 class="h2">It looks like you have clicked on the wrong link</h3>
        <p>The page you are looking for is not available!</p>
        <button  mat-flat-button color="accent" routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">Go to Home</button>
    </div>
</section>
`,
})
export class PageNotFoundComponent {}
import {Component} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
@Component({
selector: 'async-footer',
template: `

<mat-toolbar>
    <div class="courtesy">© {{ currentYear }} Diamond Project (Online). 
        <div>All Rights Reserved</div>
    </div>
    <span class="nav-spacer"></span>
   <p>
    <span>Partners platform powered by <a href="http://async.ng/" target="_blank">Async Groups</a> for Diamond Project (Online) </span> 
    </p>
</mat-toolbar>

`,
styles: `


mat-toolbar {
    width: 100%;
    .nav-spacer {
        flex: 1 1 auto;
    }
    
    p {
        font-size: 0.6em;
        a {
            text-decoration: none;
            color: inherit;
            font-weight: bold;
        }
    }
    
    .courtesy {
        font-size: 0.6em;
        div {
            margin-left: 2em;
            font-size: 0.8em;
        }
    }
    
}

/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
    mat-toolbar {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: auto;

        p {
            width: 100%;
            display: block;
            span {
                font-size: 0.8em;
                
            }
        }
        .courtesy {
            
            div {
                margin-left: 5em;
            }
        }
    }
}

`,
imports: [MatToolbarModule,]
})
export class FooterComponent {
  currentYear: number;

  constructor() {
    this.currentYear = new Date().getFullYear();
  }

}

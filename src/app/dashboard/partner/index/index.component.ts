import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { IndexSearchContainerComponent } from './search/search-container.component';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

/**
 * @title dashboard index
 */
@Component({
selector: 'async-dashboard-index',
template: `
<async-index-search-container/>

<!-- Add Content Here -->
<router-outlet/>
    
<section class="temporary-dashboard">
  <div class="container">
    <h1>Welcome to {{ appName }}</h1>
    <p>We are still working on something amazing! Stay tuned as we prepare your dashboard to help you digitise your network marketing business.</p>

    <div class="highlights">
      <div class="highlight-card">
        <mat-icon>group</mat-icon>
        <h2>Manage Your Team</h2>
        <p>Easily manage your team, track performance, and ensure everyone stays on the same page.</p>
      </div>
      <div class="highlight-card">
        <mat-icon>trending_up</mat-icon>
        <h2>Grow Your Network</h2>
        <p>Connect with new prospects, nurture relationships, and watch your network grow.</p>
      </div>
      <div class="highlight-card">
        <mat-icon>access_time</mat-icon>
        <h2>Promote Your Business</h2>
        <p>Create digital marketing campaigns, reach a wider audience, and elevate your business presence.</p>
      </div>
    </div>

    <div class="cta">
      <button mat-raised-button color="primary" routerLink="../dashboard/create-campaign">Get Started Prospecting</button>
      <button mat-stroked-button color="accent" routerLink="../dashboard/submit-ticket">Contact Support</button>
    </div>

    <footer>
      <p>&copy; {{ currentYear }} {{ appName }}. All rights reserved.</p>
    </footer>
  </div>
</section>
      
`,
styles: [`

.temporary-dashboard {
    display: flex;
    justify-content: center;
    align-items: center;
  
  .container {
    text-align: center;
    max-width: 800px;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h1 {
      color: #333;
      margin-bottom: 1rem;
    }

    p {
      color: #555;
      font-size: 1.2rem;
    }

    .highlights {
      display: flex;
      justify-content: space-around;
      margin: 2rem 0;

      .highlight-card {
        text-align: center;
        width: 30%;

        mat-icon {
          //font-size: 40px;
          //color: #3f51b5;
          margin-bottom: 0.5rem;
        }

        h2 {
          font-size: 1.5rem;
          color: #333;
        }

        p {
          color: #666;
        }
      }
    }

    .cta {
      margin: 2rem 0;

      button {
        margin: 0 0.5rem;
        padding: 0.75rem 2rem;
      }
    }

    footer {
      margin-top: 2rem;
      p {
        font-size: 0.9rem;
        color: #999;
      }
    }
  }
}
  


/* Extra small devices (phones, 600px and down) */
@media only screen and (max-width: 600px) {
  .container {
    width: 100%;
    padding: 1rem;
  }

  .highlights {
    flex-direction: column;
    align-items: center;
    width: 100%;
    .highlight-card {
      width: 100%;
      margin-bottom: 1.5em;

      h2 {
        font-size: 1em;
        width: 100% !important;
      }

      p {
        font-size: 1em;
        width: 100%;
      }
    }
  }

  .cta {
    button {
      padding: 0.6rem 1.5rem;
      font-size: 1rem;
    }
  }
}


`],
imports: [MatButtonModule, RouterModule, MatIconModule, MatCardModule, MatBadgeModule, CommonModule, IndexSearchContainerComponent, MatInputModule]
})
export class DashboardIndexComponent  {
  appName = 'Diamond Project Online Partners Platform';
  currentYear = new Date().getFullYear();
}
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
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
    <async-index-search-container />

    <router-outlet />

    <section class="temporary-dashboard">
      <div class="container">
        <h1>Welcome to {{ appName }}</h1>
        <p>
          We are still working on something amazing! Stay tuned as we prepare
          your dashboard to help you digitise your network marketing business.
        </p>

        <div class="highlights">
          <div class="highlight-card">
            <mat-icon>group</mat-icon>
            <h2>Manage Your Team</h2>
            <p>
              Easily manage your team, track performance, and ensure everyone
              stays on the same page.
            </p>
          </div>
          <div class="highlight-card">
            <mat-icon>trending_up</mat-icon>
            <h2>Grow Your Network</h2>
            <p>
              Connect with new prospects, nurture relationships, and watch your
              network grow.
            </p>
          </div>
          <div class="highlight-card">
            <mat-icon>access_time</mat-icon>
            <h2>Promote Your Business</h2>
            <p>
              Create digital marketing campaigns, reach a wider audience, and
              elevate your business presence.
            </p>
          </div>
        </div>

        <div class="cta">
          <button
            mat-raised-button
            color="primary"
            routerLink="../dashboard/create-campaign"
          >
            Get Started Prospecting
          </button>
          <button
            mat-stroked-button
            color="accent"
            routerLink="../dashboard/submit-ticket"
          >
            Contact Support
          </button>
        </div>

        <footer>
          <p>&copy; {{ currentYear }} {{ appName }}. All rights reserved.</p>
        </footer>
      </div>
    </section>
  `,
  styles: [
    `
      .temporary-dashboard {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px; /* Add some padding around the section */
        box-sizing: border-box; /* Include padding and border in the element's total width and height */
      }

      .container {
        text-align: center;
        max-width: 800px;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        background-color: #fff; /* Add a background color for better contrast */
      }

      h1 {
        color: #333;
        margin-bottom: 1rem;
        font-size: 2rem; /* Adjust font size for better readability */
      }

      p {
        color: #555;
        font-size: 1.1rem; /* Adjust font size for better readability */
        line-height: 1.6; /* Improve line spacing for better readability */
        margin-bottom: 1.5rem; /* Add some margin below paragraphs */
      }

      .highlights {
        display: flex;
        justify-content: space-around;
        margin: 2rem 0;
        gap: 1rem; /* Add some gap between highlight cards */
      }

      .highlight-card {
        text-align: center;
        flex: 1; /* Allow cards to grow and shrink equally */
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #eee; /* Add a subtle border */
        background-color: #f9f9f9; /* Add a light background */
      }

      .highlight-card mat-icon {
        font-size: 2.5rem; /* Adjust icon size */
        color: #3f51b5;
        margin-bottom: 0.75rem;
      }

      .highlight-card h2 {
        font-size: 1.3rem;
        color: #333;
        margin-bottom: 0.5rem;
      }

      .highlight-card p {
        color: #666;
        font-size: 1rem;
      }

      .cta {
        margin: 2rem 0;
        display: flex;
        flex-direction: column; /* Stack buttons on smaller screens */
        align-items: center; /* Center buttons */
        gap: 0.75rem; /* Add gap between buttons */
      }

      .cta button {
        padding: 0.75rem 2rem;
        font-size: 14px;
        min-width: 200px; /* Ensure buttons have a minimum width */
      }

      footer {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #eee; /* Add a subtle top border */
      }

      footer p {
        font-size: 0.9rem;
        color: #777; /* Slightly darker color for footer text */
      }

      /* Media query for small devices (phones, tablets) */
      @media (max-width: 768px) {
        .container {
          padding: 1.5rem;
          margin: 10px;
        }

        h1 {
          font-size: 1.75rem;
        }

        p {
          font-size: 1rem;
        }

        .highlights {
          flex-direction: column;
          align-items: center;
        }

        .highlight-card {
          width: 90%; /* Make cards take up more width on smaller screens */
          margin-bottom: 1rem;
        }

        .highlight-card mat-icon {
          font-size: 2rem;
        }

        .highlight-card h2 {
          font-size: 1.2rem;
        }

        .cta button {
          width: 100%; /* Make buttons full width on smaller screens */
          min-width: auto;
        }
      }

      /* Media query for extra small devices (phones) */
      @media (max-width: 480px) {
        .container {
          padding: 1rem;
          margin: 5px;
        }

        h1 {
          font-size: 1.5rem;
        }

        .highlight-card h2 {
          font-size: 1.1rem;
        }

        .cta button {
          font-size: 1rem;
          padding: 0.6rem 1.5rem;
        }

        footer p {
          font-size: 0.8rem;
        }
      }
    `,
  ],
  imports: [
    MatButtonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    CommonModule,
    IndexSearchContainerComponent,
    MatInputModule,
  ],
})
export class DashboardIndexComponent {
  appName = 'Diamond Project Online Partners Platform';
  currentYear = new Date().getFullYear();
}
import { Component, inject, Input, OnDestroy, OnInit, signal} from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';


/**
 * @title Mentors Program
 */
@Component({
selector: 'async-about-app',
template: `


    <section class="temporary-dashboard">
      <div class="container">
        <h1>About {{ appName }}</h1>
        <p>
          Diamond Project Online Platform is a digital solution developed to transform and empower the network marketing operations of C21FG International. 
          This comprehensive online solution empowers partners with cutting-edge tools and resources to expand their reach beyond geographical limitations.
          Built around three core goals, the platform enables partners to: <strong>Grow Team</strong> through digital innovation, intelligent <strong>Team Management</strong> and Strategic <strong>Business Promotion</strong>.


        </p>

        <div>
          <h2>Community-Driven Success</h2>
           <p>
            Beyond individual growth tools, the Platform cultivates a thriving real-time business community where partners collaborate, share insights, celebrate achievements, and support each other's entrepreneurial journeys. 
            This connected ecosystem ensures that no partner operates in isolation, fostering collective success through shared knowledge and mutual support.
           </p>
           <p>
            The platform transforms traditional network marketing by combining proven relationship-building principles with modern technology, creating unprecedented opportunities for business growth and financial independence in the digital marketplace.
           </p>
        </div>

        <div class="highlights">
          <div class="highlight-card">
            <mat-icon>group</mat-icon>
            <h2>Manage Your Team Operations</h2>
            <p>
              As networks expand, the platform provides robust management systems that streamline communication, track performance metrics, monitor team development, and facilitate seamless coordination across multi-level organizational structures.
            </p>
          </div>
          <div class="highlight-card">
            <mat-icon>trending_up</mat-icon>
            <h2>Grow Your Network</h2>
            <p>
              Partners leverage sophisticated digital marketing tools and automated systems to identify, connect with, and recruit new team members across global markets, exponentially expanding their network reach.
            </p>
          </div>
          <div class="highlight-card">
            <mat-icon>access_time</mat-icon>
            <h2>Promote Your Business</h2>
            <p>
              Partners gain access to diverse online marketing channels, social media integration, content creation tools, and digital advertising capabilities to effectively promote their business and maximize market penetration.
            </p>
          </div>
        </div>

        <div class="cta">
          <button
            mat-raised-button
            color="primary"
            routerLink="../../../../dashboard/tools/campaigns/new"
          >
            Get Started Prospecting
          </button>
          <button
            mat-stroked-button
            color="accent"
            routerLink="../../../../dashboard/support/ticket"
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
styles: [`


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
    text-align: justify;
    }

.highlights {
    display: flex;
    justify-content: space-around;
    margin: 2rem 0;
    gap: 1rem; /* Add some gap between highlight cards */
}

.highlight-card {
   text-align: center;
    flex: 1;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #eee;
    background-color: #f9f9f9;
    mat-icon {
         font-size: 1.6rem;
      color: #3f51b5;
      margin-bottom: 0.75rem;
    }
    h2 {
        font-size: 1.3rem;
        color: #333;
        margin-bottom: 0.5rem;
    }
    p {
        color: #666;
        font-size: 1rem;
    }
} 

.cta {
    margin: 2rem 0;
    display: flex;
    flex-direction: column; /* Stack buttons on smaller screens */
    align-items: center; /* Center buttons */
    gap: 0.75rem; /* Add gap between buttons */
     button {
        padding: 0.75rem 2rem;
        font-size: 14px;
        min-width: 200px; /* Ensure buttons have a minimum width */
    }
}

footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee; /* Add a subtle top border */
    p {
        font-size: 0.9rem;
        color: #777; /* Slightly darker color for footer text */
    }
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
    font-size: 20px;
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


`],
providers: [],
imports: [
    CommonModule, 
    MatIconModule, 
    RouterModule, 
    MatButtonModule, 

]
})
export class AboutAppComponent implements OnDestroy {
  
    appName = 'Diamond Project Online Partners Platform';
    currentYear = new Date().getFullYear();

  
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);

    subscriptions: Array<Subscription> = [];

    constructor(
      private router: Router,
    ) {}

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          Contact the application administrator for assistance, feedback, and suggestions for improvement.

          <p>Feel free to share any challenges you encounter while using the app, along with any suggestions for improvements or features you would like to see added.</p>
        `},
      });
    }

    ngOnDestroy() {
      // unsubscribe list
      this.subscriptions.forEach(subscription =>  subscription.unsubscribe());
    }
}

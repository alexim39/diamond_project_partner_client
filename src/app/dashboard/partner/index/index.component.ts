import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { IndexSearchContainerComponent } from './search/search-container.component';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NotificationBannerComponent } from './notification-banner/notification-banner.component';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { Subscription } from 'rxjs';

/**
 * @title dashboard index
 */
@Component({
  selector: 'async-dashboard-index',
  imports: [
    MatButtonModule,
    RouterModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    CommonModule,
    IndexSearchContainerComponent,
    MatInputModule,
    NotificationBannerComponent
  ],
template: `
    <async-notification-banner *ngIf="partner" [partner]="partner"/>
    <async-index-search-container />
    <router-outlet />


  `,
styles: [`
`],
})
export class DashboardIndexComponent {

    partner!: PartnerInterface;
    subscriptions: Subscription[] = [];
  
    constructor(
      private partnerService: PartnerService,
    ) { }
  
    ngOnInit() {
        
      // get current signed in user
      this.subscriptions.push(
        this.partnerService.getSharedPartnerData$.subscribe({
         
          next: (partner: PartnerInterface) => {
            this.partner = partner;
          },
          
      })
      )
    }
  
    ngOnDestroy() {
      // unsubscribe list
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
import { Component, inject, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../_common/logo.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router, RouterModule, } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PartnerInterface, PartnerService } from '../../_common/services/partner.service';
import { PartnerAuthService } from '../../auth/auth.service';
import { PushNotificationsComponent } from './index/push-notifications/push-notifications.component';
import { MatBadgeModule } from '@angular/material/badge';

type SubmenuKey = 'tools' | 'analytics' | 'settings' | 'activities' | 'mentorship' | 'help' | 'training';

@Component({
selector: 'async-dashboard',
templateUrl: './dashboard.component.html',
styles: [`

.sidenav-container {
  background: #eee;
  height: 100%;
  .sidenav {
    width: 200px;
    
  }
  
  .sidenav .mat-toolbar {
    background: inherit;
  }
  .mat-toolbar.mat-primary {
    position: sticky;
    top: 0;
    z-index: 1;
  }  
}


mat-sidenav {
  display: flex;
  flex-direction: column;
  mat-nav-list {
    margin-top: 12em;
    a {
      
      div {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        mat-icon {
          font-size: 1.2em;
        }
        div {
          font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
        }
      }
    }
    .sign-out {
      bottom: 0;
      left: 0;
      position: absolute;
      margin-bottom: 1em;
    }
  }
}
mat-sidenav-content {
  .nav-spacer {
    flex: 1 1 auto;
  }
  a {
    color: black;
  }
}

.active {
  color: #ffab40 !important;
  text-decoration:overline;
  font-size: 1.2em;
}

.submenu {
  padding: 0 0 5px 20px;
  border-bottom: 1px solid #e2e2e2;
  .subsubmenu {
    padding: 0 0 5px 20px;
  }
}





`],
providers: [PartnerService, PartnerAuthService],
imports: [
    MatToolbarModule, MatMenuModule, MatButtonModule, ProfileComponent, MatSidenavModule, 
    MatListModule, MatIconModule, AsyncPipe, RouterModule, PushNotificationsComponent,
    CommonModule, LogoComponent, MatBadgeModule
    
],
animations: [
  trigger('submenuToggle', [  
    state('closed', style({
        height: '0',
        overflow: 'hidden',
        opacity: 0,
    })),
    state('open', style({
        height: '*',
        overflow: 'hidden',
        opacity: 1,
    })),
    transition('closed <=> open', [
        animate('300ms ease-in-out')
    ]),
  ])
]
})
export class DashboardComponent implements OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);
  isHandset: boolean = false;
  subscriptions: Subscription[] = [];

  isMobile!: boolean;
  isTablet!: boolean;
  isDesktop!: boolean;

  //isLoading: boolean = false;

  submenus: Record<SubmenuKey, boolean> = {
    tools: false,
    analytics: false,
    settings: false,
    activities: false,
    mentorship: false,
    training: false,
    help: false,
  };

  subSubmenus: Record<string, boolean> = {};

  partner!: PartnerInterface;

  notificationCount = 0;

  // Value is returned from notification child component
  updateNotificationCount(count: number) {
    this.notificationCount = count; // Update the notification count
    //console.log('Notification count updated:', count);
  }

  constructor(
    private deviceService: DeviceDetectorService,
    private router: Router,
    private partnerAuthService: PartnerAuthService,
    private partnerService: PartnerService,
  ) {

    this.subscriptions.push(
      this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
        this.isHandset = result.matches;
      })
    )
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();

    this.subscriptions.push(
      this.partnerService.getPartner().subscribe({
        next: (response) => {
          if (response.success) {
            //console.log(response)
            this.partner = response.data as PartnerInterface ;
            this.partnerService.updatePartnerService(this.partner);
          }
        },
        error: () => {
          this.router.navigate(['/']);
        }
      })
    );
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  signOut(): void {
    // Clear any stored session data
    localStorage.clear();
    sessionStorage.clear();
  
    // Call backend signOut API
    this.subscriptions.push(
      this.partnerAuthService.signOut({}).subscribe({
        next: () => {
          localStorage.removeItem('authToken'); // Remove token from localStorage
          // Navigate to the login page
          this.router.navigate(['/'], { replaceUrl: true });
        },
        error: () => {
          //console.error('Error during sign out:', error);
          this.router.navigate(['/'], { replaceUrl: true });
        }
      })
    );
  
    this.scrollToTop();
  }
  

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  toggleSubmenu(menu: SubmenuKey) {
    for (let key in this.submenus) {
      if (key !== menu) {
        this.submenus[key as SubmenuKey] = false;
      }
    }
    this.submenus[menu] = !this.submenus[menu];
  }

  isSubmenuOpen(menu: SubmenuKey): boolean {
    return this.submenus[menu];
  }

  toggleSubSubmenu(submenu: string) {
    this.subSubmenus[submenu] = !this.subSubmenus[submenu];
  }

  isSubSubmenuOpen(submenu: string): boolean {
    return this.subSubmenus[submenu];
  }
}

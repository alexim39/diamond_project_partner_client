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
import { NavigationEnd, NavigationStart, Router, RouterModule, } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MatMenuModule } from '@angular/material/menu';
import { PartnerAuthService } from '../../auth/partner/partner-auth.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MarketingChannelsComponent } from './create-campaign/marketing-channels.component';
import { PartnerInterface, PartnerService } from '../../_common/services/partner.service';
import { Emitters } from '../../_common/emitters/emitters';

// Define the SubmenuKey type
type SubmenuKey = 'tools' | 'community' | 'analytics' | 'settings' | 'activities';

@Component({
  selector: 'async-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  providers: [PartnerService, PartnerAuthService],
  imports: [
    MatToolbarModule, MatMenuModule, MatButtonModule, ProfileComponent, MatSidenavModule, MatListModule, MatIconModule, AsyncPipe, RouterModule, CommonModule, LogoComponent,
    MarketingChannelsComponent
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
  ],
})
export class DashboardComponent implements OnDestroy {
  private breakpointObserver = inject(BreakpointObserver);

  subscriptions: Subscription[] = [];

  isMobile!: boolean;
  isTablet!: boolean;
  isDesktop!: boolean;

  isLoading: boolean = false; // Flag for loading state
  

  submenus: Record<SubmenuKey, boolean> = {
    tools: false,
    community: false,
    analytics: false,
    settings: false,
    activities: false
  };

  partner!: PartnerInterface;
  

  constructor(
    private deviceService: DeviceDetectorService, 
    private router: Router,
    private partnerAuthService: PartnerAuthService,
    private partnerService: PartnerService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true; // Set loading to true on navigation start
      } else if (event instanceof NavigationEnd) {
        this.isLoading = false; // Set loading to false on navigation end
      }
    });
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getPartner().subscribe(
        res => {
          this.partner = res as PartnerInterface
          Emitters.authEmitter.emit(true);
          //console.log(this.partner)
          
          // Update the partner object sharing service
          this.partnerService.updatePartnerService(this.partner);
        },
        error => {
          //console.log(error)
          Emitters.authEmitter.emit(false);
          // redirect to home page
          this.router.navigate(['/'])
        }
      )
    )
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  signOut(): void {
    //this.loadingSpinnerService.show();

    this.subscriptions.push(
      this.partnerAuthService.signOut({}).subscribe(res => {
        //this.authenticated = false;
        //this.loadingSpinnerService.hide()
        // redirect to login page
        this.router.navigate(['/'])
      })
    )

    this.scrollToTop();
  }


  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  toggleSubmenu(menu: SubmenuKey) {
    this.submenus[menu] = !this.submenus[menu];
  }

  isSubmenuOpen(menu: SubmenuKey): boolean {
    return this.submenus[menu];
  }
}

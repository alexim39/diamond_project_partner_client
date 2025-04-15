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
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MarketingChannelsComponent } from './campaigns/create-campaign/marketing-channels.component';
import { PartnerInterface, PartnerService } from '../../_common/services/partner.service';
import { Emitters } from '../../_common/emitters/emitters';
import { PartnerAuthService } from '../../auth/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';

type SubmenuKey = 'tools' | 'community' | 'analytics' | 'settings' | 'activities' | 'mentorship' | 'help' | 'training' | 'wibinarsEvents' | 'dailyActivity' | 'achievements';

@Component({
    selector: 'async-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [PartnerService, PartnerAuthService],
    imports: [
        MatToolbarModule, MatMenuModule, MatButtonModule, ProfileComponent, MatSidenavModule, MatListModule, MatIconModule, AsyncPipe, RouterModule, CommonModule, LogoComponent,
        MarketingChannelsComponent, MatTooltipModule
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

  subscriptions: Subscription[] = [];

  isMobile!: boolean;
  isTablet!: boolean;
  isDesktop!: boolean;

  //isLoading: boolean = false;

  submenus: Record<SubmenuKey, boolean> = {
    tools: false,
    community: false,
    analytics: false,
    settings: false,
    activities: false,
    mentorship: false,
    training: false,
    help: false,
    wibinarsEvents: false,
    dailyActivity: false,
    achievements: false,
  };

  subSubmenus: Record<string, boolean> = {};

  partner!: PartnerInterface;

  constructor(
    private deviceService: DeviceDetectorService,
    private router: Router,
    private partnerAuthService: PartnerAuthService,
    private partnerService: PartnerService,
  ) {
    /* this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      } else if (event instanceof NavigationEnd) {
        this.isLoading = false;
      }
    }); */
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();

    this.subscriptions.push(
      this.partnerService.getPartner().subscribe(
        res => {
          //console.log('p',res)
          this.partner = res as PartnerInterface;
          //Emitters.authEmitter.emit(true);
          this.partnerService.updatePartnerService(this.partner);
        },
        error => {
          //Emitters.authEmitter.emit(false);
          this.router.navigate(['/']);
        }
      )
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
      this.partnerAuthService.signOut({}).subscribe(
        () => {
          localStorage.removeItem('authToken'); // Remove token from localStorage
          // Navigate to the login page
          this.router.navigate(['/'], { replaceUrl: true });
        },
        error => {
          console.error('Error during sign out:', error);
          this.router.navigate(['/'], { replaceUrl: true });
        }
      )
    );
  
    this.scrollToTop();
  }
  

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
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

import { Component, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../_common/logo.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router, RouterModule, } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PartnerInterface, PartnerService } from '../../_common/services/partner.service';
import { ThemeTogglerService } from '../../_common/services/theme-toggler.service';
import { PartnerAuthService } from '../../auth/auth.service';
import { NotificationBellComponent } from '../notifications/bell/notification-bell.component';
import { NotificationStreamService } from '../../core/notifications/notification-stream.service';
import { MatBadgeModule } from '@angular/material/badge';

/** Goal-worded primary navigation (max 8 groups) — Home is a direct link. */
type SubmenuKey = 'journey' | 'grow' | 'team' | 'performance' | 'community' | 'resources' | 'more';

@Component({
selector: 'async-dashboard',
templateUrl: './dashboard.component.html',
styles: [`
@use "@angular/material" as mat;

.sidenav-container {
  background: var(--dp-paper);
  height: 100%;
  .sidenav {
    // Sanctioned token overrides — custom properties resolve at the
    // element, so these beat theme specificity battles by construction.
    @include mat.sidenav-overrides((
      container-background-color: var(--dp-sidenav),
      container-text-color: var(--dp-sidenav-text),
    ));
    @include mat.list-overrides((
      list-item-label-text-color: var(--dp-sidenav-text),
      list-item-leading-icon-color: var(--dp-gold),
      list-item-hover-label-text-color: var(--dp-gold),
      list-item-focus-label-text-color: var(--dp-gold),
      list-item-hover-state-layer-color: var(--dp-gold),
      list-item-hover-state-layer-opacity: 0.12,
    ));
    width: 212px;
    background: var(--dp-sidenav);
    color: var(--dp-sidenav-text);
  }

  .sidenav .mat-toolbar {
    background: transparent;
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
      color: var(--dp-sidenav-text);
      // MDC paints labels with theme on-surface (invisible on the ink
      // sidenav) — force the whole label subtree to inherit the link color.
      .mdc-list-item__primary-text,
      .mdc-list-item__primary-text div,
      .mdc-list-item__primary-text span {
        color: inherit;
      }
      div {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        mat-icon {
          font-size: 1.2em;
          color: var(--dp-gold);
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
  color: var(--dp-gold) !important;
  border-left: 3px solid var(--dp-gold);
  background: rgba(169, 127, 44, 0.14);
  font-weight: 600;
}

.submenu {
  padding: 0 0 5px 20px;
  border-bottom: 1px solid rgba(169, 127, 44, 0.25);
  a {
    color: var(--dp-sidenav-text);
    opacity: 0.85;
  }
  .subsubmenu {
    padding: 0 0 5px 20px;
  }
}

/* Mobile bottom tabs — max 5 primary destinations, thumb-friendly. */
.mobile-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  background: var(--dp-surface);
  border-top: 1px solid var(--dp-line);
  padding-bottom: env(safe-area-inset-bottom);
  a, button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 0.6em 0;
    min-height: 60px;
    justify-content: center;
    background: none;
    border: none;
    color: var(--dp-muted);
    font: inherit;
    font-size: 0.8em;
    text-decoration: none;
    cursor: pointer;
  }
  mat-icon {
    font-size: 24px;
    height: 24px;
    width: 24px;
  }
  .active-tab {
    color: var(--dp-gold-ink);
    font-weight: 700;
  }
}
.mobile-tabs-spacer {
  height: 76px;
}





`],
providers: [PartnerService, PartnerAuthService],
imports: [
    MatToolbarModule, MatMenuModule, MatButtonModule, ProfileComponent, MatSidenavModule,
    MatListModule, MatIconModule, AsyncPipe, RouterModule, NotificationBellComponent,
    CommonModule, LogoComponent, MatBadgeModule
    
],
changeDetection: ChangeDetectionStrategy.Eager,
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
export class DashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  isHandset: boolean = false;

  isMobile!: boolean;
  isTablet!: boolean;
  isDesktop!: boolean;

  //isLoading: boolean = false;

  submenus: Record<SubmenuKey, boolean> = {
    journey: false,
    grow: false,
    team: false,
    performance: false,
    community: false,
    resources: false,
    more: false,
  };

  subSubmenus: Record<string, boolean> = {};

  partner!: PartnerInterface;

  /** Live badge count — polling today, socket transport later. */
  protected readonly stream = inject(NotificationStreamService);

  private readonly themes = inject(ThemeTogglerService);
  readonly theme = this.themes.theme;

  toggleTheme(): void {
    this.themes.toggle();
  }

  constructor(
    private deviceService: DeviceDetectorService,
    private router: Router,
    private partnerAuthService: PartnerAuthService,
    private partnerService: PartnerService,
  ) {

    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();

    // One-shot session fetch — self-completes, no tracking needed.
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
    });
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
  
    // Call backend signOut API (one-shot — self-completes).
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
    });

    this.scrollToTop();
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

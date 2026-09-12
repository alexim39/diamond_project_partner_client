import { Component, DestroyRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../../_common/logo.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NavigationEnd, Router, RouterModule, } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { MatMenuModule } from '@angular/material/menu';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PartnerInterface, PartnerService } from '../../_common/services/partner.service';
import { ThemeTogglerService } from '../../_common/services/theme-toggler.service';
import { PartnerAuthService } from '../../auth/auth.service';
import { NotificationBellComponent } from '../notifications/bell/notification-bell.component';
import { OraWidgetComponent } from '../ora/ora-widget.component';
import { NotificationStreamService } from '../../core/notifications/notification-stream.service';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TopProgressService } from '../../core/loading/top-progress.service';
import type { MatDrawer } from '@angular/material/sidenav';

/** Data-driven sidenav: groups → children → (optional) grandchildren. */
export interface NavLeaf {
  label: string;
  link?: string;
  external?: string;
  title?: string;
}
export interface NavChild extends NavLeaf {
  children?: NavLeaf[];
}
export interface NavGroup {
  key: string;
  label: string;
  icon: string;
  title: string;
  children: NavChild[];
}

/**
 * Information architecture — one home per PRD module (8 groups + Home + Alerts).
 * Home · Alerts · Prospects · Marketing · My Team · My Journey · Money · Insights · Community · Me.
 * Group labels use PRD module language so training docs and the menu agree;
 * every route is preserved — only the grouping changed.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    key: 'prospects', label: 'Prospects', icon: 'person_search', title: 'Find, follow up and convert',
    children: [
      { label: 'People to meet', link: 'prospects/general-list', title: 'People you can talk to' },
      { label: 'My follow-ups', link: 'prospects/personal-list', title: 'People waiting on you' },
      { label: 'Deal board', link: 'prospects/board', title: 'Move deals forward' },
      { label: 'Everyone in one list', link: 'prospects/pipeline', title: 'Everyone in one list' },
      { label: 'Book a chat', link: 'prospects/bookings', title: 'Book a chat' },
      { label: 'Email list', link: 'prospects/email-list', title: 'Email list' },
      { label: 'Add someone', link: 'tools/contacts/new', title: 'Add someone' },
      { label: 'Everyone you know', link: 'tools/contacts/list', title: 'Everyone you know' },
    ],
  },
  {
    key: 'marketing', label: 'Marketing', icon: 'campaign', title: 'Promote your business',
    children: [
      {
        label: 'Campaigns', title: 'Invites and campaigns',
        children: [
          { label: 'Tell others', link: 'tools/campaigns/share', title: 'Tell others about the business' },
          { label: 'My invites', link: 'tools/campaigns/manage', title: 'My invites and campaigns' },
          { label: 'Link results', link: 'tools/campaigns/link', title: 'How your invite link is doing' },
          { label: 'Start a campaign', link: 'tools/campaigns/new', title: 'Start an invite campaign' },
          { label: 'Campaign results', link: 'tools/campaigns/analytics', title: 'How campaigns are doing' },
          { label: 'What campaigns earned', link: 'marketing/roi', title: 'What your campaigns earned back' },
        ],
      },
      {
        label: 'Share', title: 'Content worth sharing',
        children: [
          { label: 'Things to share', link: 'resources/ads-contents', title: 'Pictures and words to share' },
          { label: 'Prospecting guides', link: 'resources/prospecting-contents', title: 'Guides for meeting people' },
        ],
      },
      {
        label: 'Outreach', title: 'Texts and emails',
        children: [
          { label: 'Send a text', link: 'tools/sms/new', title: 'Send a text message' },
          { label: 'Sent texts', link: 'tools/sms/messages', title: 'Texts you sent' },
          { label: 'Send an email', link: 'tools/email/new', title: 'Send an email' },
          { label: 'Sent emails', link: 'tools/email/logs', title: 'Emails you sent' },
        ],
      },
    ],
  },
  {
    key: 'team', label: 'My Team', icon: 'groups', title: 'Your people and their progress',
    children: [
      { label: 'Team tree', link: 'network/tree', title: 'See everyone below you' },
      { label: 'Levels view', link: 'network/org', title: 'Levels at a glance' },
      { label: 'My members', link: 'mentorship/team/members', title: 'People on your team' },
      { label: 'Directory', link: 'mentorship/partners/my-partners', title: 'Find anyone' },
      { label: 'Team updates', link: 'insights/team-reports', title: 'Updates to and from your team' },
      { label: 'Contact lists', link: 'mentorship/team/contact-lists', title: 'Work submitted onboarding lists' },
      { label: 'Confirm training', link: 'mentorship/team/confirmations', title: 'Approve downline training completions' },
      { label: 'Start a team', link: 'mentorship/team/new', title: 'Start a new team' },
    ],
  },
  {
    key: 'journey', label: 'My Journey', icon: 'route', title: 'Where you are and what is next',
    children: [
      { label: 'My level & next steps', link: 'progress', title: 'My level and next steps' },
      { label: 'My targets', link: 'goals', title: 'My targets' },
      {
        label: 'Learn', title: 'Courses and mentors',
        children: [
          { label: 'Courses', link: 'training', title: 'Courses that move you up' },
          { label: 'Get a mentor', link: 'mentorship/new-request', title: 'Get help from a leader' },
        ],
      },
    ],
  },
  {
    key: 'money', label: 'Money', icon: 'payments', title: 'Earnings, payouts and orders',
    children: [
      { label: 'My money', link: 'earnings', title: 'Money in and out' },
      { label: 'Commission records', link: 'settings/billing/commissions', title: 'Commission records' },
      { label: 'Payments', link: 'settings/billing', title: 'Payments and billing' },
      { label: 'Buy products', link: 'products/eshop', title: 'Buy products' },
      { label: 'My orders', link: 'products/order-history', title: 'What you ordered' },
    ],
  },
  {
    key: 'insights', label: 'Insights', icon: 'insights', title: 'Understand your business',
    children: [
      { label: "How I'm doing", link: 'insights', title: 'How you and your team are doing' },
      { label: 'Contacts at a glance', link: 'contact-analytics', title: 'Your contacts at a glance' },
      { label: 'Reports & downloads', link: 'insights/downloads', title: 'Export your business data' },
    ],
  },
  {
    key: 'community', label: 'Community', icon: 'forum', title: 'Talk, events and messages',
    children: [
      { label: 'Team talk', link: 'community', title: 'What everyone is sharing' },
      { label: 'Events', link: 'community/events', title: 'Gatherings and RSVP' },
      { label: 'My messages', link: 'messages', title: 'Private messages' },
    ],
  },
  {
    key: 'me', label: 'Me & Settings', icon: 'person', title: 'Your account and help',
    children: [
      { label: 'My account', link: 'settings/profiles', title: 'Your account' },
      { label: 'My public page', link: 'settings/landing-page', title: 'Your public page' },
      { label: 'Notification settings', link: 'notifications/preferences', title: 'How you get notified' },
      { label: 'Ask Ora', link: 'ora', title: 'Chat with Ora, your growth coach' },
      { label: 'Get help', link: 'support/ticket', title: 'Ask for help' },
      { label: 'About', link: 'support/about/app', title: 'About this app' },
      { label: 'Survey', external: 'https://survey.diamondprojectonline.com/', title: 'Partners survey' },
    ],
  },
];

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
    width: 240px;
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
}

/* Branded topbar — ink in BOTH themes so links never depend on the
 * Material primary-container color (the old hardcoded black text
 * vanished on the dark-mode toolbar). */
.topbar {
  background: var(--dp-sidenav);
  color: var(--dp-sidenav-text);
  position: sticky;
  top: 0;
  z-index: 1;
  a, button {
    color: var(--dp-sidenav-text);
  }
  mat-icon {
    color: var(--dp-nav-icon);
  }
}

/* Data-driven nav — every label is an explicit .nav-label in the
 * sidenav-text token (cream on near-black ≈ 15:1 in both themes);
 * MDC internals are forced to inherit so nothing paints theme
 * on-surface over the ink background. */
.nav-list {
  padding: 0.5em 0.6em 1.5em;
  a, button {
    color: var(--dp-sidenav-text);
  }
  .mdc-list-item__primary-text,
  .mdc-list-item__primary-text span,
  .mdc-list-item__primary-text div {
    color: inherit;
  }
}
.nav-row {
  display: flex;
  align-items: center;
  gap: 0.7em;
  width: 100%;
  min-height: 44px;
  &.sub {
    min-height: 40px;
  }
}
.nav-label {
  flex: 1;
  color: var(--dp-sidenav-text);
  font-size: 0.95em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-ic {
  color: var(--dp-nav-icon);
  flex: none;
}
.nav-chev {
  color: var(--dp-sidenav-text);
  opacity: 0.7;
  flex: none;
  font-size: 20px;
  height: 20px;
  width: 20px;
}
.nav-group.open > .nav-row .nav-chev,
.nav-subgroup.open > .nav-row .nav-chev {
  opacity: 1;
}
.nav-pill {
  flex: none;
  font-size: 0.72em;
  font-weight: 700;
  line-height: 1;
  color: var(--dp-gold-ink);
  background: var(--dp-gold-soft);
  border: 1px solid var(--dp-gold);
  border-radius: 999px;
  padding: 0.3em 0.6em;
}
.nav-direct, .nav-group, .nav-subgroup, .nav-leaf {
  border-radius: 8px;
  margin: 1px 0;
}
.active {
  background: var(--dp-gold-soft);
  font-weight: 600;
  .nav-label {
    color: var(--dp-gold-ink);
  }
  .nav-ic {
    color: var(--dp-gold-ink);
  }
}
.nav-group.open {
  background: rgba(217, 179, 106, 0.10);
}
.submenu {
  margin-left: 1.1em;
  padding-left: 0.7em;
  border-left: 1px solid var(--dp-line);
}
.submenu .nav-label {
  font-size: 0.9em;
}
.subsubmenu {
  margin-left: 0.9em;
  padding-left: 0.6em;
  border-left: 1px dashed var(--dp-line);
}
.subsubmenu .nav-label {
  font-size: 0.86em;
  opacity: 0.92;
}

/* Ambient top progress — slim, non-blocking, sits under the topbar.
 * The text pill floats (no layout shift), ignores pointer events (never
 * traps input), and fades in on a short delay so instant requests don't
 * make it flicker. role="status" announces it to screen readers. */
.top-loading {
  position: sticky;
  top: 0;
  z-index: 2;
  animation: top-loading-in 0.2s ease 0.15s both;
}
@keyframes top-loading-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.top-progress {
  height: 3px;
}
.top-loading-text {
  position: fixed;
  top: 76px;
  right: 16px;
  z-index: 50;
  pointer-events: none;
  font-size: 0.8em;
  font-weight: 600;
  color: var(--dp-sidenav-text);
  background: var(--dp-sidenav);
  border: 1px solid var(--dp-line);
  border-radius: 999px;
  padding: 0.35em 0.9em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}
@media (prefers-reduced-motion: reduce) {
  .top-loading {
    animation: none;
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
    MatListModule, MatIconModule, AsyncPipe, RouterModule, NotificationBellComponent, OraWidgetComponent,
    CommonModule, LogoComponent, MatBadgeModule, MatProgressBarModule
    
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

  protected readonly navGroups = NAV_GROUPS;
  private readonly openGroups = new Set<string>();
  private readonly openSubs = new Set<string>();

  partner!: PartnerInterface;

  /** Live badge count — polling today, socket transport later. */
  protected readonly stream = inject(NotificationStreamService);
  /** Ambient top progress bar — non-blocking, ref-counted. */
  protected readonly progress = inject(TopProgressService);

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
    this.revealActiveRoute(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.revealActiveRoute(event.urlAfterRedirects));

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

  protected isOpen(key: string): boolean {
    return this.openGroups.has(key);
  }

  protected toggleGroup(key: string): void {
    if (this.openGroups.has(key)) this.openGroups.delete(key);
    else this.openGroups.add(key);
  }

  protected isSubOpen(group: string, label: string): boolean {
    return this.openSubs.has(`${group}:${label}`);
  }

  protected toggleSub(group: string, label: string): void {
    const key = `${group}:${label}`;
    if (this.openSubs.has(key)) this.openSubs.delete(key);
    else this.openSubs.add(key);
  }

  /** Close the drawer after navigating on small screens. */
  protected onNavigate(drawer: MatDrawer): void {
    this.scrollToTop();
    if (this.isHandset) drawer.close();
  }

  /** Onboarding nudge: same required rule as the Home banner (picture optional). */
  protected profileIncomplete(): boolean {
    const p = (this.partner ?? {}) as Partial<PartnerInterface> & {
      phone?: unknown; address?: { street?: unknown; city?: unknown; state?: unknown };
    };
    const filled = (v: unknown): boolean => String(v ?? '').trim().length > 0;
    return !filled(p.phone)
      || !filled(p.address?.street) || !filled(p.address?.city) || !filled(p.address?.state);
  }

  protected needsProfilePill(groupKey: string, link: string | undefined): boolean {
    return groupKey === 'me' && link === 'settings/profiles' && this.profileIncomplete();
  }

  /** Keep the group holding the active route expanded across navigations. */
  private revealActiveRoute(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    for (const group of NAV_GROUPS) {
      const hit = group.children.some((child) =>
        (child.link && path.endsWith(child.link)) ||
        (child.children ?? []).some((leaf) => leaf.link && path.endsWith(leaf.link)),
      );
      if (hit) {
        this.openGroups.add(group.key);
        for (const child of group.children) {
          if ((child.children ?? []).some((leaf) => leaf.link && path.endsWith(leaf.link))) {
            this.openSubs.add(`${group.key}:${child.label}`);
          }
        }
      }
    }
  }
}

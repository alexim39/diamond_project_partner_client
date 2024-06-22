import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { LogoComponent } from '../_common/logo.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NavigationEnd, NavigationStart, Router, RouterModule, } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

@Component({
  selector: 'async-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    MatToolbarModule,    MatButtonModule, ProfileComponent,   MatSidenavModule,    MatListModule,    MatIconModule,    AsyncPipe,    RouterModule,    CommonModule,    LogoComponent  ]
})
export class DashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isMobile!: boolean;
  isTablet!: boolean;
  isDesktop!: boolean;

  isLoading: boolean = false; // Flag for loading state

  
  constructor(private deviceService: DeviceDetectorService,  private router: Router  ) {
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
}

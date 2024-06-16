import { Component, OnInit, HostListener } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LogoComponent } from '../../_common/logo.component';
import { CommonModule } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NavigationEnd, NavigationStart, Router, RouterModule, } from '@angular/router';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'async-nav',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatProgressBarModule, LogoComponent, CommonModule, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
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

   // scroll to top when clicked
   scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}

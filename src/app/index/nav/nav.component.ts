import { Component, OnInit, HostListener } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LogoComponent } from '../../_common/logo.component';
import { CommonModule } from '@angular/common';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router, RouterModule, } from '@angular/router';

@Component({
  selector: 'async-nav',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, LogoComponent, CommonModule, RouterModule],
  template: `
  
  <mat-toolbar color="primary">
  <mat-toolbar-row>
    <span class="logo">
      <async-logo/>
    </span>
    <span class="nav-spacer"></span>
    
    <ng-content *ngIf="isDesktop">
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">
        Home
      </a>
      <a mat-button routerLink="partner/signin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">
        <mat-icon>output</mat-icon> Sign In
      </a>
      <a mat-button routerLink="partner/signup" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">
        <mat-icon>input</mat-icon> Sign Up
      </a>
    </ng-content>
  </mat-toolbar-row>

  <mat-toolbar-row *ngIf="isMobile">
    <!-- <span>Second Line</span> -->

    <span class="nav-spacer"></span>
    <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Home</a>
      <a mat-button routerLink="partner/signin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">
        <mat-icon>output</mat-icon> Sign In
      </a>
      <a mat-button routerLink="partner/signup" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">
        <mat-icon>input</mat-icon> Sign Up
      </a>
  </mat-toolbar-row>

</mat-toolbar>

`,
styles: `
.nav-spacer {
    flex: 1 1 auto;
}

`
})
export class NavComponent implements OnInit {
  isMobile!: boolean;
  isTablet!: boolean;
  isDesktop!: boolean;

  constructor(private deviceService: DeviceDetectorService,  private router: Router  ) {}

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

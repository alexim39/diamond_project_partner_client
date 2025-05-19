import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PartnerInterface } from '../../../../_common/services/partner.service';

@Component({
  selector: 'async-notification-banner',
  imports: [CommonModule, MatIconModule, RouterModule],
  providers: [],
  template: `

    @if (!isState) {
    <div class="info-alert">
      <mat-icon class="info-icon">info</mat-icon>
      <span>
        You dont have country or state in profile. You will miss timely prospect notifications. Navigate to the settings to <a routerLink="settings/profiles" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()" title="New Plan">set your address</a>.
      </span>
      <mat-icon class="close-icon" (click)="closeAddressAlert()">close</mat-icon>
    </div>
    } <!-- @else {
      <div>The user is not logged in</div>
    } -->

  `,
  styles: [
    `
      .info-alert {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color:rgb(247, 232, 217);
        color:rgb(104, 39, 19);
        padding: 12px;
        border-radius: 5px;
        font-size: 14px;
        border-left: 4px solid rgb(172, 76, 46);
        position: relative;
        margin: 1em 3em;
      }
      .info-icon {
        font-size: 20px;
        color: rgb(104, 39, 19);
        margin-right: 10px;
      }
      .close-icon {
        font-size: 20px;
        cursor: pointer;
        color: rgb(104, 39, 19);
        margin-left: auto;
      }
      .close-icon:hover {
        color: rgb(104, 39, 19);
      }

      a {
        color: rgb(104, 39, 19);
        text-decoration: underline;
        cursor: pointer;
        font-weight: bold;  
      }

      @media (max-width: 768px) {
        .info-alert {
          flex-direction: column;
          align-items: flex-start;
          font-size: 12px; /* Adjust font size for small screens */
          padding: 8px; /* Adjust padding for small screens */
        }
        .info-icon {
          margin-bottom: 8px; /* Add margin to separate icon from text */
        }
        .close-icon {
          margin-top: 8px; /* Add margin to separate close icon from text */
          margin-left: 0; /* Reset left margin */
          align-self: flex-end; /* Align close icon to the end */
        }
      }
    `
  ]
})
export class NotificationBannerComponent implements OnInit {
  @Input() partner!: PartnerInterface;
  isState = false;

  constructor() {}

  ngOnInit(): void {
    if (this.partner) {
      this.isState = this.partner?.address?.state ? true : false;
    }
  }

  closeAddressAlert() {
    this.isState = true;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
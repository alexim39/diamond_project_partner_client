import {Component, inject, Input} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { SocialMediaSettingsComponent } from './social-media/social-media.component';
import { CommonModule } from '@angular/common';
import { TestimonialWriteupSettingsComponent } from './testimonial-writeup/testimonial-writeup.component';

/**
 * @title landing page settings
 */
@Component({
selector: 'async-landing-page-setting',
template: `

<section class="async-background">
  <h2>Landing Page Settings <mat-icon class="help" (click)="showDescription()">help</mat-icon></h2>

  <section class="async-container">
      <div class="title">
          <h3>Partner Page Setup</h3>
          <!--  <div class="action-area">
              <a mat-list-item routerLink="../create-campaign" routerLinkActive="active" (click)="scrollToTop()" title="Create Campaign" mat-raised-button><mat-icon>add</mat-icon>New Campaign</a>
          </div> -->
      </div>

      <div class="content">

          <mat-tab-group>
              <mat-tab label="Social Medial Settings">
                  <async-social-media-settings *ngIf="partner" [partner]="partner"/>
              </mat-tab>
              <!-- <mat-tab label="Testimonial Video Upload"> Content 2 </mat-tab> -->
              <mat-tab label="Testimonial Write Up"> 
                  <async-testimonial-writeup-settings *ngIf="partner" [partner]="partner"/>
              </mat-tab>
          </mat-tab-group>
              
        </div>
    </section>
</section>

`,
styles: [`

.async-background {
  margin: 2em;
  .help {
    cursor: pointer;
  }
  .async-container {
    background-color: #dcdbdb;
    border-radius: 1%;
    height: 100%;
    padding: 1em;
    .title {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ccc;
        padding: 1em;
        .action-area {
            .action {
                font-weight: bold;
                margin-top: 1em;
            }
        }
    }

    .search {
      padding: 0.5em 0;
      text-align: center;
      mat-form-field {
         width: 70%;
      }
    }

    .table {
      padding: 0 1em;
      border-radius: 10px;
      background-color: white;
    }

    .no-campaign {
        text-align: center;
        color: rgb(196, 129, 4);
        font-weight: bold;
    }
  }
}

`],
imports: [MatTabsModule, CommonModule, MatIconModule, MatButtonModule, SocialMediaSettingsComponent, TestimonialWriteupSettingsComponent]
})
export class LandingPageSettingComponent {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);

  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDescription () {
    this.dialog.open(HelpDialogComponent, {
      data: {help: 'In this section, you can set up your landing page variables'},
    });
  }
}

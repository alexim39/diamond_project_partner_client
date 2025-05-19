import { Component, inject, Input } from '@angular/core';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { EnterPhoneNumbersComponent } from './enter-phone-numbers/enter-phone-numbers.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
selector: 'async-sms',
imports: [MatButtonModule, MatIconModule, MatTabsModule, RouterModule, EnterPhoneNumbersComponent, CommonModule, MatButtonToggleModule],
template: `

<section class="breadcrumb-wrapper">
    <div class="breadcrumb">
      <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Dashboard</a> &gt;
      <a>Tools</a> &gt;
      <a>SMS</a> &gt;
      <span>Send SMS</span>
    </div>
</section>
  
<section class="async-background ">
    <h2>Create Bulk SMS List <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">

        <div class="title">
            <h3>Send New SMS</h3>
            <div class="action-area">
                <mat-button-toggle-group>
                    <mat-button-toggle routerLink="../../../tools/sms/messages" routerLinkActive="active" (click)="scrollToTop()" title="View email list"><mat-icon>sms</mat-icon> Messages</mat-button-toggle>
                    <mat-button-toggle (click)="importContactPhoneNumbers()" title="Import Numbers from contact list"><mat-icon>cloud_download</mat-icon> Import Numbers from Contact</mat-button-toggle>
                </mat-button-toggle-group>

            </div>
        </div>


        <div class="container">

            <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start">
                <mat-tab label="Enter Phone Numbers">
                    <async-enter-phone-numbers *ngIf="partner" [partner]="partner"/>
                </mat-tab>
                <!-- <mat-tab label="Import From Contacts">Content 2</mat-tab> -->
                <!-- <mat-tab label="Upload From Excel File">Content 3</mat-tab> -->
              </mat-tab-group>

        </div>

        
    </section>
    
</section>

`,
styles: [`

.async-background {
    margin: 2em;
    h2 {
        mat-icon {
            cursor: pointer;
        }
    }
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
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

        .no-campaign {
            text-align: center;
            color: rgb(196, 129, 4);
            font-weight: bold;
        }
    }
}

.container {
    margin-top: 1em;
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
}


@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

`]
})
export class smsComponent {

  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);

  constructor(
    private router: Router,
  ) {}

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          Here, you can effortlessly send single or bulk SMS to your contact list and manage your SMS message.
        `},
      });
    }
  
    importContactPhoneNumbers() {
      this.router.navigate(['/dashboard/tools/contacts/list']);
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
      
}

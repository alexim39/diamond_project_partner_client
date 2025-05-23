import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { EmailService } from './email.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { EnterEmailComponent } from './enter-email/enter-email.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';


@Component({
selector: 'async-email',
imports: [MatButtonModule, MatIconModule, RouterModule, MatTabsModule, EnterEmailComponent, CommonModule, MatButtonToggleModule],
providers: [EmailService],
template: `

<section class="breadcrumb-wrapper">
    <div class="breadcrumb">
      <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Dashboard</a> &gt;
      <a>Tools</a> &gt;
      <a>Email</a> &gt;
      <span>Send email</span>
    </div>
</section>

<section class="async-background ">
    <h2>Create Bulk Email List <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">

        <div class="title">
            <div class="control">
                <div class="back" (click)="back()" title="Back">
                    <mat-icon>arrow_back</mat-icon>
                </div>
                 <mat-button-toggle-group>
                    <mat-button-toggle routerLink="../../../tools/email/logs" routerLinkActive="active" (click)="scrollToTop()" title="View email list"><mat-icon>mail</mat-icon> Mails</mat-button-toggle>
                    <mat-button-toggle (click)="importEmailsNumbers()" title="Import Emails from contact list"><mat-icon>cloud_download</mat-icon> Import Emails from Contact</mat-button-toggle>
                </mat-button-toggle-group>
            </div>
            <h3>Send New Email</h3>

        </div>


        <div class="container">

            <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start">
                <mat-tab label="Enter Email Address">
                    <async-enter-email *ngIf="partner" [partner]="partner"/>
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
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
        height: 100%;
        padding: 1em;
        .title {
            border-bottom: 1px solid #ccc;
            padding: 1em;
            display: flex;
            flex-direction: column;  
            //align-items: center; /* Vertically center the items */  
            justify-content: flex-start; 
            .control {
                display: flex;
                justify-content: space-between;
                .back {
                    cursor: pointer;
                }
                .back:hover {
                    cursor: pointer;
                    opacity: 0.5;
    
                }
            }

           
            h3 {
                margin-top: 1em; 
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
export class EmailComponent{

  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);

  constructor(
    private emailService: EmailService,
    private router: Router,
  ) {}


  showDescription () {
    this.dialog.open(HelpDialogComponent, {
      data: {help: `
        Here, you can effortlessly send single or bulk email to your contact list and manage your sent emails.
      `},
    });
  }

  importEmailsNumbers() {
    this.router.navigate(['/dashboard/tools/contacts/list']);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

   back(): void {  
      if (window.history.length > 1) {  
          window.history.back();  
      } else {  
          // Redirect to a default route if there's no history  
          this.router.navigate(['/dashboard/tools/contacts/list']);
      }  
    }
    
}

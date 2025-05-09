import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { EmailInterface, EmailService } from '../email.service';
import { EmailLogComponent } from './email-log.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


/**
 * @title Email log container
 */
@Component({
    selector: 'async-email-log-container',
    imports: [CommonModule, EmailLogComponent, MatIconModule, MatButtonModule],
    providers: [EmailService],
    template: `
  <ng-container *ngIf="!isEmptyRecord">
  <async-email-log *ngIf="partner && emails" [partner]="partner" [emails]="emails"/>
  </ng-container>
  <ng-container *ngIf="isEmptyRecord">
        <div class="container">
          <p class="no-content">Something Went Wrong or may be you dont have logs yet!</p>
          <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
        </div>
  </ng-container>
  `,
    styles: `
   .container {
     padding: 2em;
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;
   }
   .no-content {
     color: rgb(196, 129, 4);
     font-weight: bold;
   }
    
   `
})
export class EmailLogContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  emails!: any;
  isEmptyRecord = false;

  constructor(
    private partnerService: PartnerService,
    private email: EmailService,
    private router: Router,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(       
        (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            //console.log('=',this.partner)
            this.email.getEmailsCreatedBy(this.partner._id).subscribe({
              next: (response) => {
                if (response.success) {
                  this.emails = response.data;
                  if (this.emails.length === 0) {
                    this.isEmptyRecord = true;
                  }
                }          
              },
              error: () => {
                this.isEmptyRecord = true;
              }
            })
          }
        }
      )
    )
  }  

    
  back(): void {
    //window.history
   this.router.navigateByUrl('dashboard/tools/email/new');
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
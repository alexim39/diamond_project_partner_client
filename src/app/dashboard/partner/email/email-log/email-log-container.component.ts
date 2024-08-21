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
 * @title cell meeting container
 */
@Component({
  selector: 'async-email-log-container',
  standalone: true,
  imports: [CommonModule, EmailLogComponent, MatIconModule, MatButtonModule],
  providers: [EmailService],
  template: `
  <ng-container *ngIf="!isEmptyRecord">
  <async-email-log *ngIf="partner && emails" [partner]="partner" [emails]="emails"></async-email-log>
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
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            //console.log('=',this.partner)
            this.email.getEmailsCreatedBy(this.partner._id).subscribe((emails: EmailInterface) => {
              this.emails = emails;
              //console.log('emails ',this.emails)
            }, error => {
              this.isEmptyRecord = true;
            })
          }
        },
        
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    )
  }

  back(): void {
    //window.history
   this.router.navigateByUrl('dashboard/send-email');
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
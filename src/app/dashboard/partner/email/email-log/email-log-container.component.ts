import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { EmailInterface, EmailService } from '../email.service';
import { EmailLogComponent } from './email-log.component';


/**
 * @title cell meeting container
 */
@Component({
  selector: 'async-email-log-container',
  standalone: true,
  imports: [CommonModule, EmailLogComponent],
  providers: [EmailService],
  template: `
  <async-email-log *ngIf="partner && emails" [partner]="partner" [emails]="emails"></async-email-log>
  `,
})
export class EmailLogContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  emails!: any;

  constructor(
    private partnerService: PartnerService,
    private email: EmailService
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

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { EmailInterface, EmailService } from '../email.service';
import { EmailLogComponent } from './email-log.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpErrorResponse } from '@angular/common/http';


/**
 * @title Email log container
 */
@Component({
selector: 'async-email-log-container',
imports: [CommonModule, EmailLogComponent, MatIconModule, MatButtonModule],
providers: [EmailService],
template: `
 <async-email-log *ngIf="partner && emails" [partner]="partner" [emails]="emails"/>
`,
   
})
export class EmailLogContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  emails!: any;
  isEmptyRecord = false;
  serverErrorMessage = '';

  constructor(
    private partnerService: PartnerService,
    private email: EmailService,
    private router: Router,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({    
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            //console.log('=',this.partner)
            this.subscriptions.push(
              this.email.getEmailsCreatedBy(this.partner._id).subscribe({
                next: (response) => {
                  if (response.success) {
                    this.emails = response.data;
                  }
                },
                error: () => {
                  this.emails = [];
                }
              })
            )
          }
        }
      })
    )
  }  

  back(): void {
    if (window.history.length > 1) {
        //window.history  
        window.history.back();  
    } else {  
      // Redirect to a default route if there's no history  
      this.router.navigateByUrl('dashboard/tools/email/new');
    }  
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
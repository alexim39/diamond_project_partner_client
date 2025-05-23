import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { SMSService } from '../sms.service';
import { SMSLogComponent } from './sms-log.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


/**
 * @title cell meeting container
 */
@Component({
  selector: 'async-sms-log-container',
  imports: [CommonModule, SMSLogComponent, MatIconModule, MatButtonModule],
  providers: [SMSService],
  template: `
     <async-sms-log *ngIf="partner && smsObject" [partner]="partner" [smsObject]="smsObject"/>

  `,
})
export class smsLogContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  smsObject!: any;

  constructor(
    private partnerService: PartnerService,
    private sms: SMSService,
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
            this.sms.getSMSCreatedBy(this.partner._id).subscribe({
               next: (response) => {
                 if (response.success) {
                    this.smsObject = response.data;
                 }
              },
              error: () => {
                this.smsObject = [];
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
      this.router.navigateByUrl('dashboard/tools/sms/new');
    }  
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
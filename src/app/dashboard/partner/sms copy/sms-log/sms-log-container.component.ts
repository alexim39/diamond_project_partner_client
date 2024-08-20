import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { smsInterface, smsService } from '../sms.service';
import { SMSLogComponent } from './sms-log.component';


/**
 * @title cell meeting container
 */
@Component({
  selector: 'async-sms-log-container',
  standalone: true,
  imports: [CommonModule, SMSLogComponent],
  providers: [smsService],
  template: `
  <async-sms-log *ngIf="partner && smsObject" [partner]="partner" [smsObject]="smsObject"></async-sms-log>
  `,
})
export class smsLogContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  smsObject!: any;

  constructor(
    private partnerService: PartnerService,
    private sms: smsService
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            //console.log('=',this.partner)
            this.sms.getSMSCreatedBy(this.partner._id).subscribe((sms: smsInterface) => {
              this.smsObject = sms;
              //console.log('smsObject ',this.smsObject)
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
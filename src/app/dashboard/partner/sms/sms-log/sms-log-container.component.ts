import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { smsInterface, SMSService } from '../sms.service';
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
  <ng-container *ngIf="!isEmptyRecord">
    <async-sms-log *ngIf="partner && smsObject" [partner]="partner" [smsObject]="smsObject"/>
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
export class smsLogContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  smsObject!: any;
  isEmptyRecord = false;

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
            this.sms.getSMSCreatedBy(this.partner._id).subscribe((sms: smsInterface) => {
              this.smsObject = sms;
            })
          }
        }, 
        error: () => {
          this.isEmptyRecord = true;
        }

     })
    )
  }
  
  back(): void {
    //window.history
   this.router.navigateByUrl('dashboard/tools/sms/new');
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
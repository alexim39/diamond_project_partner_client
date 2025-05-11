import { Component,  Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ContactsInterface, ContactsService } from '../../contacts.service';
import { Subscription } from 'rxjs';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { SMSGatewaysService } from '../../../../../_common/services/sms.service';
import { SMSService } from '../../../sms/sms.service';
import { ProspectBasicInformationComponent } from './basic-info-panel/basic-info-panel.component';
import { ProspectStatusInformationComponent } from './status-info-panel/status-info-panel.component';
import { ProspectActionsComponent } from './actions-panel/actions-panel.component';
import { ProspectEmailPanelComponent } from './email-panel/email-panel.component';
import { ProspectSMSComponent } from './sms-panel/sms-panel.component';
import { Router } from '@angular/router';


/** @title Prospect details */
@Component({
selector: 'async-manage-contacts-detail',
template: `

<section class="async-background">
    <h2>Prospect Contact Details</h2>

    <section class="async-container">
        <div class="title">
            <div class="control">
                <div class="back" (click)="back()" title="Back">
                    <mat-icon>arrow_back</mat-icon>
                </div>
            </div>
            <h3>{{prospectData.prospectSurname | titlecase}} {{prospectData.prospectName | titlecase}}'s Details</h3>
        </div>
            <section class="flex-container">  
                <async-prospect-basic-info-panel class="flex-item" *ngIf="prospect" [prospect]="prospect"/>
                <async-prospect-status-info-panel class="flex-item" *ngIf="prospect" [prospect]="prospect"/>
                <async-prospect-actions-panel class="flex-item" *ngIf="prospect" [prospect]="prospect"/>
                <async-prospect-email-panel class="flex-item" *ngIf="prospect && partner " [prospect]="prospect" [partner]="partner"/>
                <async-prospect-sms-panel class="flex-item" *ngIf="prospect && partner " [prospect]="prospect" [partner]="partner"/>
            </section>
    </section>
</section>

`,
styles: [`

.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 1%;
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
    }
}


.flex-container {  
    display: flex;  
    flex-wrap: wrap; /* Allow items to wrap to the next line */  
    justify-content: space-around; /* Distribute space around items */  
    padding: 40px; /* Add padding around the container */  
    background-color: #ffffff; /* White background for each article */  
    border-radius: 10px;
    .flex-item {  
      flex: 1 1 20em; /* Allow flex items to grow and shrink with a minimum width of 200px */  
      min-width: 20em; /* Maximum width for articles */  
      max-width: 40em; /* Maximum width for articles */  
      margin: 15px; /* Add space around items */  
      padding: 15px; /* Padding inside articles */  
      border: 1px solid #ddd; /* Light gray border */  
      border-radius: 8px; /* Rounded corners */  
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */  
      transition: transform 0.2s; /* Transition effect for hover */  
      &:hover {  
          transform: translateY(-5px); /* Lift effect on hover */  
      }  

  }  

}  

/* Media Queries for Responsiveness */  
@media (max-width: 600px) {  
    section.flex-container {  
        justify-content: center; /* Center content on small screens */  
    }  

    article.flex-item {  
        flex-basis: 100%; /* Full width for items on small screens */  
        max-width: none; /* Remove max-width restriction */  
    }  
}  

@media (min-width: 601px) and (max-width: 900px) {  
    article.flex-item {  
        flex-basis: calc(50% - 30px); /* Two items per row on medium screens */  
    }  
}

`],
imports: [
  CommonModule, MatIconModule,
  ProspectBasicInformationComponent, ProspectStatusInformationComponent, ProspectActionsComponent, ProspectEmailPanelComponent, ProspectSMSComponent
],
providers: [ContactsService , SMSService, SMSGatewaysService]
})
export class ManageContactsDetailComponent implements OnInit, OnDestroy {

  @Input() prospect!: ContactsInterface;
  prospectData!: any; 

  subscriptions: Array<Subscription> = [];
  partner!: PartnerInterface;

  constructor(
    private router: Router, 
    private partnerService: PartnerService,
  ) {}

  back(): void {
    this.router.navigateByUrl('dashboard/tools/contacts/list');
  }

  
  ngOnInit(): void {     
    if (this.prospect.data) {
      this.prospectData = this.prospect.data;
    }

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          //console.log(this.partner)
        }
      })
    )

   }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }


}

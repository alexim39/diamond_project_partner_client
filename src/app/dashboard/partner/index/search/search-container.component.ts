import { CommonModule } from '@angular/common';
import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { IndexSearchComponent } from './search.component';


/**
 * @title Manage comapaing container
 */
@Component({
  selector: 'async-index-search-container',
  standalone: true,
  imports: [CommonModule, IndexSearchComponent],
  providers: [],
  template: `
  <async-index-search *ngIf="partner" [partner]="partner"></async-index-search>
  `,
})
export class IndexSearchContainerComponent implements OnInit, OnDestroy, AfterViewInit  {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
           /*  this.campaignService.getCampaignCreatedBy(this.partner._id).subscribe((campaigns: CampaignInterface) => {
              this.campaigns = campaigns;
              //console.log('campaign ',campaigns)
            }) */
          }
        },
        
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    )
  }

  ngAfterViewInit() {  
    this.loadAllPartners();  
  }

  private loadAllPartners() {}

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
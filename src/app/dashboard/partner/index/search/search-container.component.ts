import { CommonModule } from '@angular/common';
import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { IndexSearchComponent } from './search.component';
import { SearchService } from './search.service';


/**
 * @title Manage comapaing container
 */
@Component({
  selector: 'async-index-search-container',
  standalone: true,
  imports: [CommonModule, IndexSearchComponent],
  providers: [SearchService],
  template: `
  <async-index-search *ngIf="partner && partners" [partner]="partner" [partners]="partners"></async-index-search>
  `,
})
export class IndexSearchContainerComponent implements OnInit, OnDestroy, AfterViewInit  {

  partner!: PartnerInterface;
  partners!: Array<PartnerInterface>;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
    private searchService: SearchService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {       }
        }, (error) => {
          console.log(error)
          // redirect to home page
        }
      )
    )
  }

  ngAfterViewInit() {  
    this.loadAllPartners();  
  }

  private loadAllPartners() {
    // get all user
    this.subscriptions.push(
      this.searchService.getAllUsers().subscribe((partners: Array<PartnerInterface>) => {
        this.partners = partners;
        //console.log('partners ',partners)
      })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
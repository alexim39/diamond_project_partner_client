import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { SearchResultComponent } from './search-result.component';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../search.service';


/**
 * @title contacts container
 */
@Component({
  selector: 'async-search-result-container',
  standalone: true,
  imports: [CommonModule, SearchResultComponent],
  providers: [SearchService],
  template: `
  <async-search-result *ngIf="searchPartner?.data" [searchPartner]="searchPartner?.data" #srechResultComponentMethod></async-search-result>
  `,
})
export class SearchResultContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  searchPartner!: any;
  subscriptions: Subscription[] = [];
  
  @ViewChild(SearchResultComponent) searchResultComponent!: SearchResultComponent;

  constructor(
    private partnerService: PartnerService,
    private route: ActivatedRoute,
    private searchService: SearchService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
       
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {
            /* this.prospectListService.getProspectFor(this.partner._id).subscribe((prospectContact: ProspectListInterface) => {
              this.prospectList = prospectContact;
              //console.log('prospectContact ',prospectContact)
            }) */
          }
        },
        
        (error) => {
          console.log(error)
          // redirect to home page
        }
      )
    );

    this.subscriptions.push(
      // Subscribe to query parameters to be notified of changes  
      this.route.queryParams.subscribe(params => {  
        const name = params['name'];  
        const surname = params['surname'];  
        this.subscriptions.push(
              // Call the service to get the partner details by ID  
              this.searchService.getPartnerByName(name, surname ).subscribe(  
                  (searchPartner: PartnerInterface) => {  
                    // Handle the fetched data as needed  
                    this.searchPartner = searchPartner;
                    this.callChildMethod()
                  },  
                  (error) => {  
                    console.error('Error fetching partner details:', error);  
                  }  
              )
        )
      })
    );
  }

  private callChildMethod() {
    this.searchResultComponent.checkFollowStatus();
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
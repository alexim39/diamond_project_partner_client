
import {Component, DestroyRef, inject, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchResultComponent } from './search-result.component';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../search.service';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-search-result-container',
    imports: [SearchResultComponent],
    providers: [SearchService],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
  @if (searchPartners?.data) {
    <async-search-result [searchPartners]="$safeNavigationMigration(searchPartners?.data)" #srechResultComponentMethod></async-search-result>
  }
  `
})
export class SearchResultContainerComponent implements OnInit {

  partner!: PartnerInterface;
  searchPartners!: any;
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(SearchResultComponent) searchResultComponent!: SearchResultComponent;

  constructor(
    private partnerService: PartnerService,
    private route: ActivatedRoute,
    private searchService: SearchService,
  ) { }

  ngOnInit() {

    // get current signed in user (shared subject — tracked)
    this.partnerService.getSharedPartnerData$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(

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
      );

    // Subscribe to query parameters — switchMap cancels the in-flight
    // lookup on re-navigation instead of stacking subscriptions.
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef),
      switchMap(params => {
        if (params['name'] && params['surname']) {
          const name = params['name'].trim();
          const surname = params['surname'].trim();
          return this.searchService.getPartnerByNames(name, surname);
        }
        const name = params['name'].trim();
        return this.searchService.getPartnerByName(name);
      })
    ).subscribe({
      next: (searchPartners: PartnerInterface) => {
        // Handle the fetched data as needed
        this.searchPartners = searchPartners;
        this.callChildMethod(this.searchPartners);
      },
      error: (error) => {
        console.log(error)
        console.error('Error fetching partner details:', error);
      }
    });
  }

  private callChildMethod(searchPartners: PartnerInterface[]) {
   // if (this.searchPartners) {
      this.searchPartners.forEach((partner: PartnerInterface) => {
        this.searchResultComponent.checkFollowStatus(partner._id);
      });
    //}
    //this.searchResultComponent.checkFollowStatus();
  }
}
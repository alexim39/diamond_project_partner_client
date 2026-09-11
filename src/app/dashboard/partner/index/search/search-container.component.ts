
import {AfterViewInit, Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IndexSearchComponent } from './search.component';
import { SearchService } from './search.service';


/**
 * @title Manage comapaing container
 */
@Component({
    selector: 'async-index-search-container',
    imports: [IndexSearchComponent],
    providers: [SearchService],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
  @if (partner && partners) {
    <async-index-search [partner]="partner" [partners]="partners"></async-index-search>
  }
  `
})
export class IndexSearchContainerComponent implements OnInit, AfterViewInit  {

  partner!: PartnerInterface;
  partners!: Array<PartnerInterface>;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private partnerService: PartnerService,
    private searchService: SearchService,
  ) { }

  ngOnInit() {

    // get current signed in user (shared subject — tracked)
    this.partnerService.getSharedPartnerData$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          if (this.partner) {       }
        }, (error) => {
          console.log(error)
          // redirect to home page
        }
      )
  }

  ngAfterViewInit() {
    this.loadAllPartners();
  }

  private loadAllPartners() {
    // get all user (one-shot HTTP — self-completes)
    this.searchService.getAllUsers().subscribe((partners: Array<PartnerInterface>) => {
        this.partners = partners;
        //console.log('partners ',partners)
      })
  }
}
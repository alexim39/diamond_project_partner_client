
import {Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { filter, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GeneralProspectListComponent } from './general-prospect-list.component';
import { ProspectService, ProspectListInterface } from '../prospects.service';


/**
 * @title contacts container
 */
@Component({
    selector: 'async-prospect-list-container',
    imports: [GeneralProspectListComponent],
    providers: [ProspectService],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
  @if (partner && prospectList) {
    <async-prospect-list [partner]="partner" [prospectList]="prospectList"/>
  }
  `
})
export class GeneralProspectListContainerComponent implements OnInit {

  partner!: PartnerInterface;
  prospectList!: ProspectListInterface[];
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private partnerService: PartnerService,
    private prospectListService: ProspectService,
  ) { }

  ngOnInit() {

    // get current signed in user, then the org-wide list — one stream.
    // (Org scope is why this page stays: the pipeline table is mine-only.)
    this.partnerService.getSharedPartnerData$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((partner): partner is PartnerInterface => !!partner),
      tap(partner => { this.partner = partner; }),
      switchMap(() => this.prospectListService.getAllProspect())
    ).subscribe({
      next: (response) => {
        this.prospectList = response.data;
      },
      error: () => {
        this.prospectList = [];
      },
    })
  }
}
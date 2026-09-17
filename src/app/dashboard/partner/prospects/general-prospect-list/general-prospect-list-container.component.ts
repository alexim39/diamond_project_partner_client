import { Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GeneralProspectListComponent } from './general-prospect-list.component';

/**
 * @title pool container — session partner only; the page fetches its own
 * geo-fenced shelf (the legacy org-wide list fetch is retired).
 */
@Component({
  selector: 'async-prospect-list-container',
  imports: [GeneralProspectListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (partner) {
      <async-prospect-list [partner]="partner" />
    }
  `,
})
export class GeneralProspectListContainerComponent implements OnInit {
  partner!: PartnerInterface;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private partnerService: PartnerService) {}

  ngOnInit() {
    this.partnerService.getSharedPartnerData$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((partner): partner is PartnerInterface => !!partner),
        tap((partner) => {
          this.partner = partner;
        }),
      )
      .subscribe();
  }
}

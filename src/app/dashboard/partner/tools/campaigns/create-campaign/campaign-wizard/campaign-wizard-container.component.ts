import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { CampaignWizardComponent } from './campaign-wizard.component';
import { CreateCampaignService } from '../create-campaign.service';

/**
 * @title Start-a-campaign container — supplies the signed-in partner.
 */
@Component({
  selector: 'async-campaign-wizard-container',
  template: `
  @if (partner) {
    <async-campaign-wizard [partner]="partner"/>
  }
  `,
  providers: [CreateCampaignService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CampaignWizardComponent],
})
export class CampaignWizardContainerComponent implements OnInit, OnDestroy {
  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

  constructor(private partnerService: PartnerService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        },
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}

import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FacebookComponent } from './facebook/facebook.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { LinkedinComponent } from './linkedin/linkedin.component';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../../_common/help-dialog.component';
import { RouterModule } from '@angular/router';

/**
 * @title marketing channesl tab
 */
@Component({
selector: 'async-marketing-channels',
templateUrl: 'marketing-channels.component.html',
styles: [`

.async-background {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding-bottom: 2em;
    .page-head {
        display: flex;
        align-items: center;
        gap: 0.6em;
        flex-wrap: wrap;
        h2 { margin: 0; }
    }
    .subtitle { margin: 0; color: var(--dp-muted); max-width: 44em; }
    .async-container {
        background: var(--dp-surface);
        border: 1px solid var(--dp-line);
        border-radius: var(--dp-radius);
        height: 100%;
        padding: 1em;
    }
    mat-icon {
        cursor: pointer;
    }
}

`],
changeDetection: ChangeDetectionStrategy.Eager,
imports: [MatTabsModule, RouterModule, FacebookComponent, YoutubeComponent, LinkedinComponent, MatIconModule]
})
export class MarketingChannelsComponent implements OnInit, OnDestroy {
  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  readonly dialog = inject(MatDialog);

  constructor(
    private partnerService: PartnerService
  ) { }

  ngOnInit() {

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        }
      })
    )
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: { help: 'In this section, you can create a paid campaign on your selected social media platform to promote your unique link' },
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
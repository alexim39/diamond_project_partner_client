import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { FacebookComponent } from './facebook/facebook.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { GoogleComponent } from './google/google.component';
import { LinkedinComponent } from './linkedin/linkedin.component';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { RouterModule } from '@angular/router';

/**
 * @title marketing channesl tab
 */
@Component({
    selector: 'async-marketing-channels',
    templateUrl: 'marketing-channels.component.html',
    styleUrls: ['marketing-channels.component.scss'],
    imports: [MatTabsModule, RouterModule, FacebookComponent, YoutubeComponent, GoogleComponent, LinkedinComponent, CommonModule, MatIconModule]
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
      this.partnerService.getSharedPartnerData$.subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          //console.log(this.partner)
        },
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    )
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: { help: 'In this section, you can create a paid campaign on your selected social media platform to promote your unique link' },
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
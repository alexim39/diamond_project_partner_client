import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { FacebookComponent } from './facebook/facebook.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { GoogleComponent } from './google/google.component';
import { LinkedinComponent } from './linkedin/linkedin.component';
import { PartnerInterface, PartnerService } from '../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

/**
 * @title marketing channesl tab
 */
@Component({
  selector: 'async-marketing-channels',
  templateUrl: 'marketing-channels.component.html',
  styleUrls: ['marketing-channels.component.scss'],
  standalone: true,
  imports: [MatTabsModule, FacebookComponent, YoutubeComponent, GoogleComponent, LinkedinComponent, CommonModule],
})
export class MarketingChannelsComponent implements OnInit, OnDestroy {
  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

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

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
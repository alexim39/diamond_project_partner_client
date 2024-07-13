import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { FacebookComponent } from './facebook/facebook.component';
import { YoutubeComponent } from './youtube/youtube.component';
import { GoogleComponent } from './google/google.component';
import { LinkedinComponent } from './linkedin/linkedin.component';

/**
 * @title marketing channesl tab
 */
@Component({
  selector: 'async-marketing-channels',
  templateUrl: 'marketing-channels.component.html',
  styleUrls: ['marketing-channels.component.scss'],
  standalone: true,
  imports: [MatTabsModule, FacebookComponent, YoutubeComponent, GoogleComponent, LinkedinComponent],
})
export class MarketingChannelsComponent {}
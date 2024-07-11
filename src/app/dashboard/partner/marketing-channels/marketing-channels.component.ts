import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { FacebookComponent } from './facebook/facebook.component';

/**
 * @title marketing channesl tab
 */
@Component({
  selector: 'async-marketing-channels',
  templateUrl: 'marketing-channels.component.html',
  styleUrls: ['marketing-channels.component.scss'],
  standalone: true,
  imports: [MatTabsModule, FacebookComponent],
})
export class MarketingChannelsComponent {}
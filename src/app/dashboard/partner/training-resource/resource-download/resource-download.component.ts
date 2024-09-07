import {Component, inject, Input} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { TextDownloadComponent } from './text-download/text-download.component';
import { ImageDownloadComponent } from './image-download/image-download.component';
import { VideoDownloadComponent } from './video-download/video-download.component';
import { CommonModule } from '@angular/common';


/**
 * @title Basic use of the tab group
 */
@Component({
  selector: 'async-resource-download',
  templateUrl: 'resource-download.component.html',
  styleUrls: ['resource-download.component.scss'],
  standalone: true,
  imports: [MatTabsModule, MatIconModule, CommonModule, TextDownloadComponent,  ImageDownloadComponent, VideoDownloadComponent],
})
export class ResourceDownloadComponent {
  @Input() partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  readonly dialog = inject(MatDialog);

  constructor() { }

  ngOnInit() {}

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: 'In this section, you can download text, image and video templates for promoting your link on any digital platform'},
      });
    }
  
    ngOnDestroy() {
      // unsubscribe list
      this.subscriptions.forEach(subscription => {
        subscription.unsubscribe();
      });
    }
}

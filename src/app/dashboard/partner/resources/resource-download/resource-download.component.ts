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
template: `

<section class="async-background ">
  <h2>Resource Templates Downloads <mat-icon (click)="showDescription()">help</mat-icon></h2>

  <section class="async-container">
    
    <mat-tab-group>
      <mat-tab label="Download Text Contents"> 
        <async-text-download *ngIf="partner" [partner]="partner"/>
      </mat-tab>
      <mat-tab label="Download Image Contents (Banners/Flyers)">
        <async-image-download *ngIf="partner" [partner]="partner"/>
      </mat-tab>
      <mat-tab label="Download Video Contents">
        <async-video-download/>
      </mat-tab>
    </mat-tab-group>

  </section>
</section>

`,
styles: [`

.async-background {
  margin: 2em;
  .async-container {
      //background-color: #dcdbdb;
      border-radius: 1%;
      height: 100%;
      padding: 1em;
      mat-tab-group {
          background-color: white;
          border-radius: 10px;
      }
  }
  mat-icon {
    cursor: pointer;
  }
}

`],
imports: [MatTabsModule, MatIconModule, CommonModule, TextDownloadComponent, ImageDownloadComponent, VideoDownloadComponent]
})
export class ResourceDownloadComponent {
  @Input() partner!: PartnerInterface;
  subscriptions: Subscription[] = [];
  readonly dialog = inject(MatDialog);

  showDescription () {
    this.dialog.open(HelpDialogComponent, {
      data: {help: 'In this section, you can download text, image and video templates for promoting your link on any digital platform'},
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

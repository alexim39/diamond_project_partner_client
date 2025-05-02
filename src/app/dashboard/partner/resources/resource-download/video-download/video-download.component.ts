import {Component} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Basic use of the tab group
 */
@Component({
    selector: 'async-video-download',
    templateUrl: 'video-download.component.html',
    styleUrls: ['video-download.component.scss'],
    imports: [MatTabsModule]
})
export class VideoDownloadComponent {}

import { Component, inject, Input, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {MatTabsModule} from '@angular/material/tabs';

/**
 * @title Basic Inputs
 */
@Component({
    selector: 'async-preapproach-download',
    styleUrls: ['pre-approach-download.component.scss'],
    templateUrl: 'pre-approach-download.component.html',
    standalone: true,
    imports: [FormsModule, MatFormFieldModule, MatTabsModule, MatButtonModule, MatInputModule, MatIconModule, MatInputModule],
})
export class PreApproachDownloadComponent implements OnInit {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);

    ngOnInit(): void {
        console.log(this.partner)
    }


    downloadPreApproachPDF(): void {
        const link = document.createElement('a');
        link.href = 'docs/pre-approach_tool_for_Diamondprojectonline.pdf'; // Update the path if necessary
        link.download = 'pre-approach-document.pdf';
        link.click();
      }
      


    showDescription () {
        this.dialog.open(HelpDialogComponent, {
          data: {help: `
            Here, you can download pre-approach documents that could be used for prospecting
          `},
        });
      }

}

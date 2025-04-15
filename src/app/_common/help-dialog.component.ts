import { CommonModule } from '@angular/common';
import {Component, inject} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';

/**
 * @title Help Dialog
 */
@Component({
    selector: 'async-help-dialog',
    template: `

<!-- <h2 mat-dialog-title>Hi</h2> -->

<mat-dialog-content>
  <div [innerHTML]="data.help"></div>
  <!-- <p>{{data.help}}</p> -->

</mat-dialog-content>

<mat-dialog-actions>
<button mat-button (click)="close()">Ok</button>
</mat-dialog-actions>

  `,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose]
})
export class HelpDialogComponent {
    readonly dialogRef = inject(MatDialogRef<HelpDialogComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);

    close(): void {
        this.dialogRef.close();
    }
}
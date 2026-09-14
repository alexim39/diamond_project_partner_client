
import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { SMSService } from '../../sms.service';

/**
 * @title SMS Details Dialog
*/

@Component({
    selector: 'async-sms-detail-dialog',
    template: `
    <section>
        <h2 mat-dialog-title>
            SMS Detail
        </h2>
        <mat-dialog-content class="mat-typography">
            <small class="muted">Message:</small>
            <p [innerHTML]="safeHtmlSmsBody" class="body-text"></p>
            <br>

            <small class="muted">Recipient: {{data.prospect.length}}</small>
            <p class="body-text muted"> {{data.prospect}} </p>
        </mat-dialog-content>

        <mat-accordion>

        <mat-expansion-panel class="more-action">
            <mat-expansion-panel-header>
                <mat-panel-title> More Action </mat-panel-title>
                </mat-expansion-panel-header>
                <p class="muted">Delete prospect from system</p>
                <button mat-stroked-button (click)="deleteSMS(data._id)" class="danger">
                <mat-icon>delete</mat-icon>
                Delete
                </button>
            </mat-expansion-panel>
        </mat-accordion>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Ok</button>
            <!-- <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Install</button> -->
        </mat-dialog-actions>
    </section>
  `,
    styles: `
    .muted { color: var(--dp-muted); }
    .body-text { line-height: 1.7em; overflow-wrap: anywhere; }
    .more-action { margin: 2em; }
    .danger { color: var(--dp-error); }
    html[data-theme='dark'] .danger { color: #e89a9a; }
  `,
    providers: [SMSService],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatDialogModule, MatExpansionModule, MatListModule, MatIconModule, MatButtonModule]
})
export class SMSDetailDialogComponent implements OnDestroy, OnInit {
    readonly data = inject<any>(MAT_DIALOG_DATA);
    subscriptions: Array<Subscription> = [];
    readonly dialogRef = inject(MatDialogRef<SMSDetailDialogComponent>);

    // Angular sanitizes [innerHTML] by default — no bypass (stored-XSS safe).
    safeHtmlSmsBody = '';

    constructor(
        private sms: SMSService
    ) { }

    ngOnInit(): void {
        //console.log(this.data)
        this.safeHtmlSmsBody = String(this.data?.smsBody ?? '');
    }

    close(): void {
        this.dialogRef.close();
    }

    deleteSMS(smsId: string) {
        Swal.fire({
            title: "Are you sure of this delete action?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                /*  Swal.fire({
                  title: "Deleted!",
                  text: "Your file has been deleted.",
                  icon: "success"
                }); */

                //const partnerId = this.partner._id;

                this.subscriptions.push(
                    this.sms.deleteSingleSMS(smsId).subscribe((res: any) => {
                        //console.log(res)
                        Swal.fire({
                            position: "bottom",
                            icon: 'success',
                            text: `${res.message}`,
                            showConfirmButton: true,
                            confirmButtonText: "Ok",
                            confirmButtonColor: "#ffab40",
                            timer: 15000,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //this.router.navigateByUrl('dashboard/manage-contacts');
                                location.reload();
                            }
                        });

                    }, (error: any) => {
                        //console.log(error)
                        Swal.fire({
                            position: "bottom",
                            icon: 'info',
                            text: 'Server error occured, please try again',
                            showConfirmButton: false,
                            timer: 4000
                        })
                    })
                )

            }
        });
    }

    ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }
}

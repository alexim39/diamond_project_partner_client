import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EmailService } from '../../email.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title Email Details Dialog
*/

@Component({
    selector: 'async-email-detail-dialog',
    template: `
    <section>
        <h2 mat-dialog-title>
            {{data.emailSubject | uppercase }}
        </h2>
        <mat-dialog-content class="mat-typography">
            <small style="color: gray;">Message:</small>
            <p [innerHTML]="safeHtmlEmailBody" style="line-height: 1.7em;"></p>

            <small style="color: gray;">Recipient: {{data.prospects.length}}</small>
            <p style="line-height: 1.7em; color: gray"> 
                {{ data.prospects.join(', ') }}
            </p>
        </mat-dialog-content>

        <mat-accordion>

        <mat-expansion-panel style="margin: 2em">
            <mat-expansion-panel-header>
                <mat-panel-title> More Action </mat-panel-title>
                </mat-expansion-panel-header>
                <p style="color: gray;">Delete prospect from system</p>
                <button mat-stroked-button (click)="delete(data._id)" style="color: red;">
                <mat-icon>delete</mat-icon>
                Delete
                </button>
            </mat-expansion-panel>
        </mat-accordion>

        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Ok</button>
        </mat-dialog-actions>
    </section>
  `,
    styles: `
  `,
    providers: [EmailService],
    imports: [MatDialogModule, MatExpansionModule, CommonModule, MatListModule, MatIconModule, MatButtonModule]
})
export class EmailDetailDialogComponent implements OnDestroy, OnInit {
    readonly data = inject<any>(MAT_DIALOG_DATA);
    subscriptions: Array<Subscription> = [];
    readonly dialogRef = inject(MatDialogRef<EmailDetailDialogComponent>);

    safeHtmlEmailBody!: SafeHtml;

    constructor(
        private email: EmailService,
        private sanitizer: DomSanitizer
    ) { }

    ngOnInit(): void {
        //console.log(this.data)
        this.safeHtmlEmailBody = this.sanitizer.bypassSecurityTrustHtml(this.data.emailBody);
    }

    close(): void {
        this.dialogRef.close();
    }

    delete(id: string) {
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
                this.subscriptions.push(
                    this.email.deleteSingleEmail(id).subscribe({

                        next: (response) => {
                            Swal.fire({
                              position: "bottom",
                              icon: 'success',
                              text: response.message,
                              showConfirmButton: true,
                              timer: 10000,
                              confirmButtonText: "Ok",
                              confirmButtonColor: "#ffab40",
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    //this.router.navigateByUrl('dashboard/manage-contacts');
                                    location.reload();
                                }
                            });
                          },
                          error: (error: HttpErrorResponse) => {
                            let errorMessage = 'Server error occurred, please try again.'; // default error message.
                            if (error.error && error.error.message) {
                              errorMessage = error.error.message; // Use backend's error message if available.
                            }
                            Swal.fire({
                              position: "bottom",
                              icon: 'error',
                              text: errorMessage,
                              showConfirmButton: false,
                              timer: 4000
                            });  
                          }
                          
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

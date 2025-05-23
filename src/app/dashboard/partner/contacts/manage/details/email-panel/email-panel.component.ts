import {Component, Input, OnInit} from '@angular/core';
import { ContactsInterface, ContactsService } from '../../../contacts.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PartnerInterface } from '../../../../../../_common/services/partner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';



@Component({
selector: 'async-prospect-email-panel',
template: `

<article>  
    <h2>Send Email</h2>  

    <div class="list">
        <h5> Email</h5>

        <span class="data" style="display: flex; flex-direction: column;">
            <mat-form-field appearance="outline">
                <mat-label>Email Subject</mat-label>
                <input matInput [(ngModel)]="emailSubject" placeholder="Eg. Join Us for a 30-Minute Insight Session Online!">
            </mat-form-field>
        </span>
        
        <div class="copy-link">
            <p>
                www.diamondprojectonline.com/{{partner.username}}
            </p>
            <mat-icon title="Copy" (click)="copyLink()">content_copy</mat-icon>
        </div>
        <span class="data" style="display: flex; flex-direction: column;">
            <mat-form-field appearance="outline">
                <mat-label>Write Email</mat-label>
                <textarea matInput class="custom-textarea" [(ngModel)]="emailBody"></textarea>
                <mat-hint align="start" style="color: orange"><strong>Write Email to prospect email address (Don't forget to include your link)</strong> </mat-hint>
            </mat-form-field>
            
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 2em">
                <button mat-flat-button (click)="sendEmail()">Send</button>
            </div>
        </span>
    </div>
</article> 

`,
styles: `

.list {
    margin-bottom: 1em;
    h5 {
        color: gray
    }
    .data {
        font-weight: bold;
        .custom-textarea {  
            min-width: 500px;
            min-height: 300px; 
        }
    }
    .info {
        color: gray;
        font-size: 0.9em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
    .wrap {
        word-wrap: break-word;
        max-width: 10px !important; /* Adjust as needed */
    }
    .copy-link {
       // background-color: gray;
        display: flex;
        justify-content: space-between;
        align-items: center;
        p {
            font-weight: bold;
        }
        mat-icon {
            cursor: pointer;
        }
    }
}

`,
imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule, 
    MatButtonModule,
    CommonModule,
],
})
export class ProspectEmailPanelComponent implements OnInit {
    @Input() prospect!: ContactsInterface;
    @Input() partner!: PartnerInterface;
    prospectData!: any; 

    emailSubject: string = ''; 
    emailBody: string = '';

    subscriptions: Array<Subscription> = [];

     
  constructor(
    private contactsService: ContactsService,
    private snackBar: MatSnackBar,
  ) {}


    ngOnInit(): void {     
        if (this.prospect) {
        this.prospectData = this.prospect;
        }
    }

    copyLink() {  
        const link = `www.diamondprojectonline.com/${this.partner.username}`;  
        navigator.clipboard.writeText(link).then(() => {  
        this.snackBar.open('Link copied to clipboard!', 'Close', {  
            duration: 2000,  
        });  
        }).catch(err => {  
        console.error('Failed to copy: ', err);  
        });  
    } 

    sendEmail() {
        const emailObject = {
        partner: this.partner, 
        prospect: this.prospectData, 
        emailBody: this.emailBody,
        emailSubject: this.emailSubject
        }
        this.subscriptions.push(

        this.contactsService.sendProspectEmail(emailObject).subscribe( {

            next: (response) => {
                Swal.fire({
                    position: "bottom",
                    icon: 'success',
                    text: response.message,
                    showConfirmButton: true,
                    timer: 10000,
                    confirmButtonColor: "#ffab40",
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
            
        } )

    );
  }


   ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
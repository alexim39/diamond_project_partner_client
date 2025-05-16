import {Component, Input, OnInit} from '@angular/core';
import { ContactsInterface, ContactsService } from '../../../contacts.service';
import { CommonModule } from '@angular/common';
import { PartnerInterface } from '../../../../../../_common/services/partner.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SMSGatewaysService } from '../../../../../../_common/services/sms.service';
import { SMSService } from '../../../../sms/sms.service';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
selector: 'async-prospect-sms-panel',
template: `
<article>  
    <h2>Send SMS</h2>  
    <div class="list">
        <h5> SMS</h5>
        <div class="copy-link">
            <p>
                www.diamondprojectonline.com/{{partner.username}}
            </p>
            <mat-icon title="Copy" (click)="copyLink()">content_copy</mat-icon>
        </div>
        <span class="data" style="display: flex; flex-direction: column;">
            <mat-form-field appearance="outline">
                <mat-label>Write SMS</mat-label>
                <textarea matInput #SMS maxlength="160" [(ngModel)]="sms"></textarea>
                <mat-hint align="start" style="color: orange"><strong>Short SMS to prospect phone number (Don't forget to include your link)</strong> </mat-hint>
                <mat-hint align="end">{{SMS.value.length}} / 160</mat-hint>
            </mat-form-field>
            
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 2em">
                <button mat-flat-button (click)="sendSMS()">Send</button>
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
export class ProspectSMSComponent implements OnInit {
    @Input() prospect!: ContactsInterface;
    @Input() partner!: PartnerInterface;
    prospectData!: any; 

    sms: string ='';

    subscriptions: Array<Subscription> = [];

    constructor(
    private contactsService: ContactsService,
    private smsService: SMSService,
    private snackBar: MatSnackBar,
    private smsGatewayService: SMSGatewaysService
  ) {}

    ngOnInit(): void {     
        if (this.prospect.data) {
          this.prospectData = this.prospect.data;
          //console.log('propsect', this.prospectData)
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

     sendSMS() {
    
        this.subscriptions.push(
          this.contactsService.signleSMSCharge(this.partner._id ).subscribe({

            next: (response) => {
              const transactionId = response?.data._id;
              // call sms gateway
              this.callSMSGate(transactionId)
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


  private callSMSGate(transactionId: string) {

   this.subscriptions.push(

      this.smsGatewayService.send(this.prospectData.prospectPhone, this.sms).subscribe({  
          //console.log('SMS sent successfully:', response);  
        next: (response) =>{
          let status = '';
          if (response.data.status == 'success') {
            status = 'success';
          } else {
             status = 'failed';
          }

          const smsObject = {
            partner: this.partner._id, 
            prospect: this.prospectData.prospectPhone, 
            smsBody: this.sms,
            transactionId: transactionId,
            status
          }

          this.subscriptions.push(
            this.smsService.saveSMSRecord(smsObject).subscribe({
              next: (response) => {
                Swal.fire({
                  position: "bottom",
                  icon: 'info',
                  text: response.message,//'SMS was not sent successfully',
                  showConfirmButton: false,
                  timer: 4000
                })
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
    );
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
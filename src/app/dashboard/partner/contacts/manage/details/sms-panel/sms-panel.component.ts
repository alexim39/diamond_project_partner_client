import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import type { ContactsInterface } from '../../../contacts.service';

import { PartnerInterface } from '../../../../../../_common/services/partner.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SMSService } from '../../../../sms/sms.service';
import { HttpErrorResponse } from '@angular/common/http';
import { userError } from '../../../../../../core/http/api-error';



@Component({
selector: 'async-prospect-sms-panel',
template: `
<article>  
    <h2>Send SMS</h2>  
    <div class="list">
        <h5> SMS</h5>
        <div class="copy-link">
            <p>
                www.c21fg.online/{{partner.username}}
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
            min-width: min(500px, 100%);
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
changeDetection: ChangeDetectionStrategy.Eager,
imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
],
})
export class ProspectSMSComponent implements OnInit {
    @Input() prospect!: ContactsInterface;
    @Input() partner!: PartnerInterface;
    prospectData!: any; 

    sms: string ='';

    subscriptions: Array<Subscription> = [];

    constructor(
    private smsService: SMSService,
    private snackBar: MatSnackBar,
  ) {}

    ngOnInit(): void {     
        if (this.prospect) {
          this.prospectData = this.prospect;
          //console.log('propsect', this.prospectData)
        }
    }

    copyLink() {  
        const link = `www.c21fg.online/${this.partner.username}`;  
        navigator.clipboard.writeText(link).then(() => {  
        this.snackBar.open('Link copied to clipboard!', 'Close', {  
            duration: 2000,  
        });  
        }).catch(err => {  
        console.error('Failed to copy: ', err);  
        });  
    }

     // Session-owned single send: charge + gateway + record happen
     // server-side (v1/outreach/sms). Retires the legacy
     // charge-then-browser-gateway chain (leaked gateway secret).
     sendSMS() {
        const body = String(this.sms ?? '').trim();
        if (!body) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Write a message first.',
            showConfirmButton: false,
            timer: 4000
          });
          return;
        }
        this.subscriptions.push(
          this.smsService.sendBulkSMS({ to: [this.prospectData.prospectPhone], body }).subscribe({
            next: (res) => {
              this.sms = '';
              Swal.fire({
                position: "bottom",
                icon: res?.data?.failed?.length ? 'info' : 'success',
                text: res?.message ?? 'SMS sent successfully',
                showConfirmButton: false,
                timer: 4000
              });
            },
            error: (error: HttpErrorResponse) => {
                Swal.fire({
                    position: "bottom",
                    icon: 'error',
                    text: userError(error),
                    showConfirmButton: false,
                    timer: 4000
                });
            }
          })
        )
     }


   ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
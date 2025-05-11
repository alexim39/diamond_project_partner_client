import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { ContactsInterface, ContactsService } from '../../../contacts.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
selector: 'async-prospect-status-info-panel',
template: `

<article>  
    <h2>Status Information</h2>  

    <div class="list">
        <h5> Currrent Pipeline Status </h5>
        <span class="data"> {{ selectedStatus ? selectedStatus : prospectData.status }}</span>
    </div>
    <mat-divider></mat-divider>

    <div class="list">
        <h5> Update Status </h5>
        <span class="data" style="display: flex; flex-direction: column;">
            <mat-form-field appearance="outline">
                <mat-label>Choose status to update</mat-label>
                <mat-select [(value)]="selectedStatus" required>
                    <mat-option  value="New Prospect">New Prospect</mat-option>
                    <mat-option  value="Contacted">Contacted</mat-option>
                    <mat-option  value="Follow-Up Scheduled">Follow-Up Scheduled</mat-option>
                    <mat-option  value="Engaged">Engaged</mat-option>
                    <mat-option  value="Sent Information">Sent Information</mat-option>
                    <mat-option  value="Awaiting Response">Awaiting Response</mat-option>
                    <mat-option  value="Interested">Interested</mat-option>
                    <mat-option  value="Nurturing">Nurturing</mat-option>
                    <mat-option  value="Closing">Closing</mat-option>
                    <mat-option  value="Booked for Session">Booked for Session</mat-option>
                    <mat-option  value="Member">Member</mat-option>
                    <mat-option  value="Not Interested">Not Interested</mat-option>
                    <mat-option  value="Disqualified">Disqualified</mat-option>
                    <mat-option  value="Inactive">Inactive</mat-option>
                    <mat-option  value="Re-engagement">Re-engagement</mat-option>
                    <mat-option  value="Archive">Archive</mat-option>
                    <mat-option  value="Partner">Partner</mat-option>
                </mat-select>
            </mat-form-field>

            <div style="display: flex; justify-content: center; align-items: center;">
                <button mat-flat-button (click)="updateProspectStatus()">Update Status</button>
            </div>
            
        </span>
    </div>
    <mat-divider></mat-divider>

    <div class="list">
        <h5> Currrent Communication History </h5>
        <span class="data wrap"> {{ communication ? communication : prospectData.prospectRemark }}</span>
    </div>
    <mat-divider></mat-divider>

    <div class="list">
        <h5> Update Communication History </h5>
        <span class="data" style="display: flex; flex-direction: column;">
            <mat-form-field appearance="outline">
                <mat-label>Enter remark/comment</mat-label>
                <textarea matInput [(ngModel)]="communication"  #message maxlength="256"></textarea>
                <mat-hint align="start" style="color: orange"><strong>Short remark about prospect info</strong> </mat-hint>
                <mat-hint align="end">{{message.value.length}} / 256</mat-hint>
            </mat-form-field>


            <div class="interest-level">
                <h4> Select Interest Level </h4>
                <mat-radio-group aria-label="By Interest Level" [(ngModel)]="selectedInterestLevel">
                    <mat-radio-button value="hot">
                        Hot lead (ready to sign up)
                    </mat-radio-button>
                    <mat-radio-button value="warm">
                        Warm lead (interested but need nurturing)
                    </mat-radio-button>
                    <mat-radio-button value="cold">
                        Cold lead (minimal interest shown)
                    </mat-radio-button>
                    <mat-radio-button value="customer">
                        Customer (only interested in the product)
                    </mat-radio-button>
                </mat-radio-group>

            <p>You selected: {{ selectedInterestLevel }}</p>
            </div>

            
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 2em">
                <button mat-flat-button [disabled]="prospectData.status === 'Partner'" (click)="updateProspectCommunication()">Update Remark</button>
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
  MatListModule, 
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatButtonModule,
  MatRadioModule,
],
})
export class ProspectStatusInformationComponent implements OnInit, OnDestroy {
    @Input() prospect!: ContactsInterface;
    prospectData!: any; 

    subscriptions: Array<Subscription> = [];

    selectedStatus: string = '';
    communication: string = '';
    selectedInterestLevel: string = '';


     constructor(
        private contactsService: ContactsService,
    ) {}

    ngOnInit(): void {     
      if (this.prospect.data) {
      this.prospectData = this.prospect.data;
      }
    }

    updateProspectStatus() {
    const obj = {status: this.selectedStatus, prospectId: this.prospectData._id } 
    if (!obj.status) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You should select a status before updating!',
        showConfirmButton: false,
        timer: 4000
      })
      return;
    }
    this.subscriptions.push(
      this.contactsService.updateProspectStatus(obj).subscribe({
        next: (response) => {
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: response.message,
            showConfirmButton: true,
            timer: 10000,
            confirmButtonColor: "#ffab40",
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
   }


  updateProspectCommunication() {

    const communicationObject = {
      communication: this.communication, 
      selectedInterestLevel: this.selectedInterestLevel, 
      prospectId: this.prospectData._id 
    } 
    if (!communicationObject.communication) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You should enter new conversation before updating!',
        showConfirmButton: false,
        timer: 4000
      })
      return;
    }

    this.subscriptions.push(
      this.contactsService.updateProspectCommunications(communicationObject).subscribe({
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
    }))

  }

   ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

}
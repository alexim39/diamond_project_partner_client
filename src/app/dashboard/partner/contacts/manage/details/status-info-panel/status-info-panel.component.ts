import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { CommunicationInterface, ContactsInterface, ContactsService } from '../../../contacts.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';



@Component({
selector: 'async-prospect-status-info-panel',
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
  MatDatepickerModule,
  MatNativeDateModule,
  MatExpansionModule,
  MatCardModule,
  MatIconModule
],
template: `

<article>
  <h2>Status Information</h2>

  <!-- Current Pipeline Status -->
  <div class="list">
    <h6>Current Pipeline Status</h6>
    <span class="data">
      {{ selectedStatus ? selectedStatus : prospectData?.status?.name }} 
      @if (prospectData?.status?.paydayDate) {
        - {{prospectData.status.paydayDate | date}}
      } @else if (prospectData?.status?.expectedDecisionDate) {
        - {{prospectData.status.expectedDecisionDate | date}}
      } @else if (prospectData?.status?.onboardingDate) {
         - {{prospectData.status.onboardingDate | date}}
      }
    </span>
    <div class="sub-data">{{ prospectData?.status?.note ? prospectData.status.note : '' }}</div>
  </div>
  <mat-divider></mat-divider>

  <!-- Update Status -->
  <div class="list">
    <h5>Update Status</h5>
    <span class="data" style="display: flex; flex-direction: column;">

      <mat-form-field appearance="outline">
      <mat-label>Choose status to update</mat-label>
        <mat-select [(value)]="selectedStatus" (selectionChange)="onStatusChange($event.value)" required>


        <!-- Initial Stage: New Contact -->
        <mat-optgroup label="Initial Contact">
          <mat-option value="New Prospect">New Prospect</mat-option>
          <mat-option value="Contacted - No Response">Contacted – No Response</mat-option>
          <mat-option value="Intro Call Completed">Intro Call Completed</mat-option>
        </mat-optgroup>

        <!-- Follow-Up Sequences -->
        <mat-optgroup label="Follow-Up Status">
          <mat-option value="Follow-Up Scheduled">Follow-Up Scheduled</mat-option>
          <mat-option value="Follow-Up Missed">Follow-Up Missed</mat-option>
          <mat-option value="Follow-Up Complete">Follow-Up Complete</mat-option>
        </mat-optgroup>

        <!-- Prospect Behavior -->
        <mat-optgroup label="Engagement & Behavior">
          <mat-option value="Watched Video (Partial)">Watched Opportunity Video (Partial)</mat-option>
          <mat-option value="Watched Video (Full)">Watched Opportunity Video (Full)</mat-option>
          <mat-option value="Attended Webinar">Attended Live/Recorded Webinar</mat-option>
          <mat-option value="Requested More Info">Requested More Info</mat-option>
          <mat-option value="Requested Success Stories">Requested Success Stories</mat-option>
          <mat-option value="Sample/Product Received">Sample or Product Received</mat-option>
        </mat-optgroup>

        <!-- Commitments & Promises -->
        <mat-optgroup label="Commitments Made">
          <mat-option value="Promised to Join">Promised to Join</mat-option>
          <mat-option value="Thinking About It">Needs Time to Think</mat-option>
          <mat-option value="Will Decide After Event">Decision After Event</mat-option>
          <mat-option value="Waiting for Pay Day">Waiting for Pay Day</mat-option>
        </mat-optgroup>

        <!-- Sales Funnel Progression -->
        <mat-optgroup label="Sales Funnel Stage">
          <mat-option value="Interested">Interested</mat-option>
          <mat-option value="Nurturing">Nurturing</mat-option>
          <mat-option value="Closing Phase">In Closing Phase</mat-option>
          <mat-option value="Booked for Onboarding">Booked for Onboarding</mat-option>
        </mat-optgroup>

        <!-- Final Outcomes -->
        <mat-optgroup label="Final Outcome">
          <mat-option value="Currently a Member">Currently a Member</mat-option>
          <mat-option value="Now a Partner">Now a Partner</mat-option>
          <mat-option value="Not Interested">Not Interested</mat-option>
          <mat-option value="Disqualified">Disqualified</mat-option>
          <mat-option value="Inactive">Inactive</mat-option>
          <mat-option value="Needs Re-engagement">Needs Re-engagement</mat-option>
          <mat-option value="Archived">Archived</mat-option>
        </mat-optgroup>

      </mat-select>
    </mat-form-field>


  <!-- Conditional Additional Inputs -->
  <ng-container *ngIf="selectedStatus === 'Waiting for Pay Day'">
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Expected Pay Day</mat-label>
      <input matInput [matDatepicker]="paydayPicker" [(ngModel)]="followUpDetails.paydayDate">
      <mat-datepicker-toggle matSuffix [for]="paydayPicker"></mat-datepicker-toggle>
      <mat-datepicker #paydayPicker></mat-datepicker>
    </mat-form-field>
  </ng-container>

  <ng-container *ngIf="selectedStatus === 'Promised to Join' || selectedStatus === 'Thinking About It'">
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Expected Decision Date</mat-label>
      <input matInput [matDatepicker]="decisionDatePicker" [(ngModel)]="followUpDetails.expectedDecisionDate">
      <mat-datepicker-toggle matSuffix [for]="decisionDatePicker"></mat-datepicker-toggle>
      <mat-datepicker #decisionDatePicker></mat-datepicker>
    </mat-form-field>
  </ng-container>

  <ng-container *ngIf="selectedStatus === 'Booked for Onboarding'">
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Onboarding Date</mat-label>
      <input matInput [matDatepicker]="onboardingDatePicker" [(ngModel)]="followUpDetails.onboardingDate">
      <mat-datepicker-toggle matSuffix [for]="onboardingDatePicker"></mat-datepicker-toggle>
      <mat-datepicker #onboardingDatePicker></mat-datepicker>
    </mat-form-field>
  </ng-container>

  <ng-container *ngIf="selectedStatus">
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>Note or Context (Optional)</mat-label>
      <textarea matInput rows="2" [(ngModel)]="followUpDetails.note" placeholder="Add any specific promise, objection, or interest..."></textarea>
    </mat-form-field>
  </ng-container>


      <div style="display: flex; justify-content: center; align-items: center;">
        <button mat-flat-button color="primary" (click)="updateProspectStatus()">Save Status</button>
      </div>
    </span>
  </div>
  <mat-divider></mat-divider>
  <br>

  <!-- Communication Form --> 
  <mat-accordion>

  <!-- Record Communication -->
    <mat-expansion-panel [expanded]="true">
      <mat-expansion-panel-header>
        <mat-panel-title> Record Communications </mat-panel-title>
        <!-- <mat-panel-description> This is a summary of the content </mat-panel-description> -->
      </mat-expansion-panel-header>
      
      
        <form [formGroup]="communicationForm" (ngSubmit)="onSubmit()" class="communication-form">

        <!-- Date Field -->
        <mat-form-field appearance="outline">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="date" required />
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="communicationForm.controls['date'].invalid && communicationForm.controls['date'].touched">
            Date is required.
          </mat-error>
        </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type" required>
              <mat-option value="call">Call</mat-option>
              <mat-option value="email">Email</mat-option>
              <mat-option value="text">Text Message</mat-option>
              <mat-option value="whatsapp call">WhatsApp Call</mat-option>
              <mat-option value="whatsapp chat">WhatsApp Chat</mat-option>
              <mat-option value="zoom">Zoom Meeting</mat-option>
              <mat-option value="meeting">In-person Meeting</mat-option>
            </mat-select>
            <mat-error *ngIf="communicationForm.controls['type'].invalid && communicationForm.controls['type'].touched">
              Communication type is required.
            </mat-error>
          </mat-form-field>

          <!-- Duration Field -->
          <mat-form-field appearance="outline" *ngIf="communicationForm.controls['type'].value === 'call' || communicationForm.controls['type'].value === 'zoom' || communicationForm.controls['type'].value === 'whatsapp call'">
            <mat-label>Duration (minutes)</mat-label>
            <input matInput type="number" formControlName="duration" min="0" required  placeholder="Eg. 60"/>
            <mat-error *ngIf="communicationForm.controls['duration'].invalid && communicationForm.controls['duration'].touched">
              Duration must be at least 0.
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" required placeholder="Add any specific remarks, comments, or observation..."></textarea>
            <mat-error *ngIf="communicationForm.controls['description'].invalid && communicationForm.controls['description'].touched">
              Description is required.
            </mat-error>
          </mat-form-field>


          <mat-form-field appearance="outline">
            <mat-label>Topics Discussed (comma-separated)</mat-label>
            <input matInput formControlName="topicsDiscussed" placeholder="startup costs, business opportunity, additional income" />
          </mat-form-field>

          <!-- Interest Level -->
          <div class="interest-level">
            <h4>Select Interest Level</h4>
            <mat-radio-group aria-label="By Interest Level" formControlName="selectedInterestLevel">
              <mat-radio-button value="hot">Hot lead (ready to sign up)</mat-radio-button>
              <mat-radio-button value="warm">Warm lead (interested but need nurturing)</mat-radio-button>
              <mat-radio-button value="cold">Cold lead (minimal interest shown)</mat-radio-button>
              <mat-radio-button value="customer">Customer (only interested in the product)</mat-radio-button>
            </mat-radio-group>
          </div>

          <div style="display: flex; justify-content: center; align-items: center; margin-top: 2em;">
            <button mat-flat-button color="primary" type="submit" [disabled]="communicationForm.invalid">Save Communication</button>
          </div>
        </form>

    </mat-expansion-panel>

    <!-- View communictaions -->
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <mat-panel-title>
          View Communications
        </mat-panel-title>
      </mat-expansion-panel-header>

      @if (prospectData.communications.length === 0) {

        <div class="no-communiction">
          <p>
            No communication record available yet
          </p>
        </div>

      } @else {

          <div *ngFor="let communication of prospectData.communications" class="communication-card">
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                {{ communication.type | titlecase }} on {{ communication.date | date:'mediumDate' }}
              </mat-card-title>
              <mat-card-subtitle>
                Interest Level: {{ communication.interestLevel | titlecase }}
              </mat-card-subtitle>
              <mat-icon 
                class="delete-icon" 
                (click)="deleteCommunication(communication._id)"
                matTooltip="Delete Communication">
                delete
              </mat-icon>
            </mat-card-header>
            <mat-card-content>
              <p><strong>Description:</strong> {{ communication.description }}</p>
              <p *ngIf="communication.duration"><strong>Duration:</strong> {{ communication.duration }} minutes</p>
              <p><strong>Topics Discussed:</strong> {{ communication.topicsDiscussed.join(', ') || 'None' }}</p>
            </mat-card-content>
          </mat-card>
        </div>

      }

    </mat-expansion-panel>

  </mat-accordion>

</article>   


`,
styles: `


// General styles for the component
:host {
  display: block;
  padding: 20px;
  //background-color: #f5f5f5; // Light background for the entire component
}

// Styling for the list section
.list {
  margin-bottom: 1.5em;

  h5 {
    color: #555; // Slightly darker gray for better readability
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .data {
    font-weight: bold;
    color: #333; // Darker text for emphasis
    font-size: 1em;

    .custom-textarea {
      min-width: 500px;
      min-height: 300px;
    }
  }

  .sub-data {
    color: gray;
    margin-top: 0.5em;
  }

  .info {
    color: #777; // Subtle gray for additional info
    font-size: 0.9em;
    margin: 0.5em 0;
  }

  .wrap {
    word-wrap: break-word;
    max-width: 100%; // Ensure it fits within the container
  }

  .copy-link {
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      font-weight: bold;
    }

    mat-icon {
      cursor: pointer;
      color: #ffab40; // Highlight color for icons
    }
  }
}

.no-communiction {
  p {
    color: orange;
    font-size: 0.8em;
  }
}

// Styling for the communication form
.communication-form {
  display: flex;
  flex-direction: column;
  gap: 20px; // Add spacing between form fields
  padding: 20px;
  background-color: #ffffff; // White background for contrast
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  mat-form-field {
    width: 100%; // Ensure fields take full width
  }

  .interest-level {
    background-color: #f9f9f9; // Subtle background for the radio group
    padding: 15px;
    border: 1px solid #e0e0e0; // Light border for separation
    border-radius: 8px;

    h4 {
      margin-bottom: 10px;
      font-size: 1.1em;
      color: #333; // Darker text for better readability
    }

    mat-radio-group {
      display: flex;
      flex-direction: column;
      gap: 10px; // Add spacing between radio buttons
    }

    mat-radio-button {
      font-size: 0.9em;
      color: #555; // Slightly lighter text for radio buttons
    }
  }

  .submit-button {
    display: flex;
    justify-content: center;
    margin-top: 20px;

    button {
      width: 200px;
      font-size: 1em;
      font-weight: bold;
      background-color: #ffab40; // Highlight color for the button
      color: #fff;

      &:hover {
        background-color: #ff9100; // Darker shade on hover
      }
    }
  }
}

// Styling for the communication cards
.communication-card {
  margin-bottom: 20px;

  mat-card {
    background-color: #ffffff; // White background for the card
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 15px;

    mat-card-header {
      border-bottom: 1px solid #e0e0e0; // Light border for separation
      margin-bottom: 10px;

      mat-card-title {
        font-size: 1.2em;
        font-weight: bold;
        color: #333; // Darker text for titles
      }

      mat-card-subtitle {
        font-size: 0.9em;
        color: #777; // Subtle gray for subtitles
      }
    }

    mat-card-content {
      p {
        margin: 5px 0;
        font-size: 0.95em;
        color: #555; // Slightly darker gray for content text

        strong {
          color: #333; // Darker text for emphasis
        }
      }
    }

     .delete-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        color: #f44336; // Red color for delete icon
        cursor: pointer;
        font-size: 1.5em;
        transition: transform 0.2s ease, color 0.2s ease;

        &:hover {
          color: #d32f2f; // Darker red on hover
          transform: scale(1.2); // Slightly enlarge the icon on hover
        }
      }
  }
}

// Mobile responsiveness
@media (max-width: 600px) {
  .communication-form {
    padding: 15px;
    gap: 15px;

    .interest-level {
      padding: 10px;
    }

    .submit-button {
      button {
        width: 100%; // Full width button for mobile
      }
    }
  }

  .communication-card {
    mat-card {
      padding: 10px;
    }
  }
}
`,

})
export class ProspectStatusInformationComponent implements OnInit, OnDestroy {
  @Input() prospect!: ContactsInterface;
  prospectData!: any; 

  subscriptions: Array<Subscription> = [];

  communication: string = '';
  selectedInterestLevel: string = '';

  communicationForm!: FormGroup;
  submissionResult: CommunicationInterface | null = null;

  selectedStatus: string = '';
  followUpDetails: {
    paydayDate?: Date;
    expectedDecisionDate?: Date;
    onboardingDate?: Date;
    note?: string;
  } = {};


  onStatusChange(status: string): void {
    this.selectedStatus = status;

    // Optional: Reset inputs when switching status
    this.followUpDetails = {};
  }


  constructor(
      private contactsService: ContactsService,
      private fb: FormBuilder
  ) {}

  ngOnInit(): void {     
      if (this.prospect.data) {
        this.prospectData = this.prospect.data;
        //console.log(this.prospectData)
      }

      this.communicationForm = this.fb.group({
        selectedInterestLevel: ['', Validators.required],
        date: [new Date(), Validators.required],
        type: ['call', Validators.required],
        duration: [null, Validators.min(0)],
        description: ['', Validators.required],
        //personOfInterest: ['', Validators.required],
        topicsDiscussed: [''],
        //additionalNotes: [''], // Add any additional fields here
      });

      // Update duration validation based on the selected type
      this.communicationForm.controls['type'].valueChanges.subscribe(type => {
        const durationControl = this.communicationForm.controls['duration'];
        if (type === 'call' || type === 'zoom') {
          durationControl.setValidators([Validators.min(0)]);
        } else {
          durationControl.clearValidators();
          durationControl.setValue(null); // Reset duration for other types
        }
        durationControl.updateValueAndValidity();
      });
    }
    updateProspectStatus() {

    const payload = {
      prospectId: this.prospectData._id,
      status: {
        name: this.selectedStatus,
        note: this.followUpDetails.note,
        paydayDate: this.followUpDetails.paydayDate,
        expectedDecisionDate: this.followUpDetails.expectedDecisionDate,
        onboardingDate: this.followUpDetails.onboardingDate,
      }
    }

      if (!payload.status) {
        Swal.fire({
          position: "bottom",
          icon: 'info',
          text: 'You should update a status before saving!',
          showConfirmButton: false,
          timer: 4000
        })
        return;
      }
      this.subscriptions.push(
        this.contactsService.updateProspectStatus(payload).subscribe({
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

   ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onSubmit(): void {
    if (this.communicationForm.valid) {
      const formData = this.communicationForm.value;
      const communicationData: CommunicationInterface = {
        interestLevel: formData.selectedInterestLevel,
        date: formData.date,
        type: formData.type,
        description: formData.description,
        //personOfInterest: formData.personOfInterest,
        topicsDiscussed: formData.topicsDiscussed ? formData.topicsDiscussed.split(',').map((topic: string) => topic.trim()) : [],
        //additionalNotes: formData.additionalNotes, // Capture additional notes
        prospectId: this.prospectData._id,
      };

      if (formData.duration !== null) {
        communicationData.duration = formData.duration;
      }

      // Log or send the data to the backend
      this.submissionResult = communicationData;
      //console.log('Communication Data to be saved:', communicationData);

      this.subscriptions.push(
        this.contactsService.updateProspectCommunications(communicationData).subscribe({
          next: (response) => {
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: response.message,
              showConfirmButton: true,
              timer: 10000,
              confirmButtonColor: "#ffab40",
            });

              // Optionally reset the form after submission
              this.communicationForm.reset({ date: new Date(), type: 'call' });
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

    } else {
      // Trigger validation to show error messages
      Object.values(this.communicationForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }


  deleteCommunication(communicationId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.push(
          this.contactsService.deleteCommunictaionEntry(this.prospectData._id, communicationId).subscribe({
            next: (response) => {
              Swal.fire({
                position: 'bottom',
                icon: 'success',
                text: response.message,
                showConfirmButton: true,
                timer: 5000,
                confirmButtonColor: '#ffab40',
              });
              // Remove the deleted communication from the list
              this.prospectData.communications = this.prospectData.communications.filter(
                (c: CommunicationInterface) => c._id !== communicationId
              );
            },
            error: (error: HttpErrorResponse) => {
              let errorMessage = 'Server error occurred, please try again.';
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              }
              Swal.fire({
                position: 'bottom',
                icon: 'error',
                text: errorMessage,
                showConfirmButton: false,
                timer: 4000,
              });
            },
          })
        );
      }
    });
  }

}
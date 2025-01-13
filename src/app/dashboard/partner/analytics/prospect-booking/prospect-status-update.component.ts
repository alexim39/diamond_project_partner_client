import { CommonModule } from '@angular/common';
import {Component, inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import Swal from 'sweetalert2';

/**
 * @title Help Dialog
 */
@Component({
  selector: 'async-prospect-response',
  styles: `
  span {
    color: gray;
  }
  .bolder {
    font-weight: bolder;
    color: black;
    margin-top: 5px;
  }
  .long-description {  
    white-space: normal; /* Ensures text wraps */  
    overflow: visible;   /* Ensures no clipping of text */  
    
  }
  .custom-list-item {  
    height: inherit;

  }  

  form {
    display: flex;
    flex-direction: column;
    mat-form-field {
      width: 100%;
    }
  }

  `,
  template: `

<h2 mat-dialog-title>{{data.surname | titlecase}} {{data.name | titlecase}}'s Booking Details & Update</h2>

<mat-dialog-content>
  
<mat-list>
  
  <mat-list-item>
    <span matListItemTitle>Phone Number:</span>
    <span matListItemLine class="bolder">{{data.phone}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Email Address:</span>
    <span matListItemLine class="bolder">{{data.email}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Current Booking Status:</span>
    <span matListItemLine class="bolder">{{data.status}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Session Date:</span>
    <span matListItemLine class="bolder">{{data.consultDate | date }}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Session Time:</span>
    <span matListItemLine class="bolder">{{data.consultTime}}</span>
    <!-- <small style="color: gray;"><em>Note that {{data.referralCode}} may be a partner in our business</em></small> -->
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Channel of Contact:</span>
    <span matListItemLine class="bolder">{{data.contactMethod}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Purpose of Session:</span>
    <span matListItemLine class="bolder">{{data.reason}}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item>  
    <span matListItemTitle>Session Scheduler:</span>  
    <span matListItemLine class="bolder">  
      <ng-container *ngIf="data.referral === 'Booked for prospect'; else bookedByProspect">  
        {{ data.referral }}  
      </ng-container>  
      <ng-template #bookedByProspect>  
        booked by prospect  
      </ng-template>  
    </span>  
  </mat-list-item>  
  <mat-divider></mat-divider>

  <mat-list-item>
    <span matListItemTitle>Date of Booking</span>
    <span matListItemLine class="bolder">{{ data.updatedAt | date:'fullDate' }} by {{ data.updatedAt | date:'shortTime' }}</span>
  </mat-list-item>
  <mat-divider></mat-divider>

  <mat-list-item *ngIf="data.description" class="custom-list-item">  
    <span matListItemTitle>Current Comment/Remark:</span>  
    <span matListItemLine class="bolder long-description">{{ data.description }}</span>  
  </mat-list-item>  
  <mat-divider></mat-divider>

  <form [formGroup]="bookingUpdateForm" (ngSubmit)="onSubmit()">
  <mat-list-item class="custom-list-item">
    <span matListItemTitle><!-- Update Session Status: --></span>
    <span matListItemLine class="bolder long-description">
      
    <mat-form-field appearance="outline">
      <mat-label>Update Session Status</mat-label>
      <mat-select formControlName="sessionStatus" required>
        <mat-option value="Scheduled">Scheduled</mat-option>
        <mat-option value="No Show from Prospect">No Show from Prospect</mat-option>
        <mat-option value="No Show from Partner">No Show from Partner</mat-option>
        <mat-option value="Completed">Completed</mat-option>
        <mat-option value="Incomplete">Incomplete</mat-option>
        <mat-option value="Rebooked">Rebooked</mat-option>
        <mat-option value="In Progress">In Progress</mat-option>
        <mat-option value="Cancelled">Cancelled</mat-option>
      </mat-select>
      <mat-error *ngIf="bookingUpdateForm.get('sessionStatus')?.hasError('required')">
          This field is required.  
      </mat-error>
    </mat-form-field>

    </span>
  </mat-list-item>
  <!-- <mat-divider></mat-divider> -->

  <mat-list-item class="custom-list-item" style="margin: -2.5em 0 1em 0;">
    <span matListItemTitle><!-- Update Session Status: --></span>
    <span matListItemLine class="bolder long-description">
      
      <mat-form-field appearance="outline">
      <mat-label>Leave a comment or remark</mat-label>
      <textarea matInput formControlName="sessionRemark" required></textarea>
      <mat-error *ngIf="bookingUpdateForm.get('sessionRemark')?.hasError('required') ">
          This field is required.  
      </mat-error> 
    </mat-form-field>

    </span>
  </mat-list-item>
 <!--  <mat-divider></mat-divider> -->

  <button mat-raised-button>Update</button>
  </form>



</mat-list>

</mat-dialog-content>

<mat-dialog-actions>
<button mat-button (click)="close()">Close</button>
</mat-dialog-actions>

  `,
  standalone: true,
  providers: [AnalyticsService],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatListModule, MatInputModule, MatSelectModule,MatDialogModule, MatButtonModule, MatDividerModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class BookingStatusUpdateComponent implements OnInit {
    readonly dialogRef = inject(MatDialogRef<BookingStatusUpdateComponent>);
    readonly data = inject<any>(MAT_DIALOG_DATA);
    bookingUpdateForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
      private analyticsService: AnalyticsService,
      //private router: Router,
    ) {}

    ngOnInit(): void {
      //console.log(this.data)
      if (this.data) {
        this.bookingUpdateForm = new FormGroup({
          sessionStatus: new FormControl('', Validators.required),
          sessionRemark: new FormControl('', Validators.required),
          id: new FormControl(this.data._id),
          //id: this.data._id
        });
      }
    }

  onSubmit( ) {
    // Mark all form controls as touched to trigger the display of error messages
    this.markAllAsTouched();

    if (this.bookingUpdateForm.valid) {
      const formData: FormGroup = this.bookingUpdateForm.value;

      this.subscriptions.push(
        this.analyticsService.updateBookingStatus(formData).subscribe((res: any) => {
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Session details updated successfully',
            showConfirmButton: true,
            confirmButtonColor: "#ffab40",
            timer: 10000,
          }).then((result) => {
            /*  if (result.isConfirmed) {
              this.router.navigate(['/dashboard/prospect-detail', this.prospect?.data?._id]);
            } */
            this.close();
          });
          //this.router.navigateByUrl('get-started/connected-economy');
        }, (error: Error) => {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please try again',
            showConfirmButton: false,
            timer: 4000
          });
        })
      )
    }
    
  }

   // Helper method to mark all form controls as touched
   private markAllAsTouched() {
    Object.keys(this.bookingUpdateForm.controls).forEach(controlName => {
      this.bookingUpdateForm.get(controlName)?.markAsTouched();
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
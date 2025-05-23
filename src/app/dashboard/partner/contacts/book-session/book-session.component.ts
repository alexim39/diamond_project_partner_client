import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import {MatSelectModule} from '@angular/material/select';
import { Subscription } from 'rxjs';
import { ContactsInterface, ContactsService } from '../contacts.service';
import { MatInputModule } from '@angular/material/input';  
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Location } from '@angular/common';  
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title Contacts
 */
@Component({
selector: 'async-book-session',
providers: [ContactsService],
imports: [CommonModule, MatIconModule, RouterModule, 
  MatDatepickerModule, MatNativeDateModule, MatButtonToggleModule, MatFormFieldModule, 
  MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatSelectModule
],
template: `

<section class="async-background ">
    <h2>Book Prospect Session <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">
        <div class="title">
            <div class="control">
                <div class="back" (click)="back()" title="Back">
                    <mat-icon>arrow_back</mat-icon>
                </div>
                <!-- <button mat-raised-button><mat-icon>download</mat-icon>Download</button> -->
            </div>
            <h3>{{prospect?.prospectSurname | titlecase}} {{prospect?.prospectName | titlecase}}'s Session Booking</h3>
        </div>


        <div class="form-container">
            <form class="flex-form" [formGroup]="prospectContactForm" (ngSubmit)="onSubmit()">
                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Name</mat-label>
                        <input matInput formControlName="prospectName" required>
                        <mat-error *ngIf="prospectContactForm.get('prospectName')?.hasError('required') ">
                            This field is required.  
                        </mat-error> 
                    </mat-form-field>
                </div>

                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Surname</mat-label>
                        <input matInput formControlName="prospectSurname" required>
                        <mat-error *ngIf="prospectContactForm.get('prospectSurname')?.hasError('required') ">
                            This field is required.  
                        </mat-error> 
                    </mat-form-field>
                </div>

                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Email Address</mat-label>
                        <input matInput formControlName="prospectEmail" required>
                        <mat-error *ngIf="prospectContactForm.get('prospectEmail')?.hasError('required') "> 
                            This field is required.  
                        </mat-error> 
                    </mat-form-field>
                </div>

                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Phone Number</mat-label>
                        <input matInput formControlName="prospectPhone" required>
                        <mat-error *ngIf="prospectContactForm.get('prospectPhone')?.hasError('required') ">
                            This field is required.  
                        </mat-error> 
                    </mat-form-field>
                </div>

                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Source of Contact</mat-label>
                        <mat-select formControlName="prospectSource" required>
                            <mat-option value="Family">Family</mat-option>
                            <mat-option value="Friend">Friend</mat-option>
                            <mat-option value="Relative">Relative</mat-option>
                            <mat-option value="Unique Link">Unique Link</mat-option>
                            <mat-option value="Referrals">Referrals</mat-option>
                            <mat-option value="Contact Recommendation">Contact Recommendation</mat-option>
                            <mat-option value="Social Media">Social Media</mat-option>
                            <mat-option value="Website">Website</mat-option>
                            <mat-option value="Content Marketing">Content Marketing</mat-option>
                            <mat-option value="Email Marketing">Email Marketing</mat-option>
                            <mat-option value="Networking Events">Networking Events</mat-option>
                            <mat-option value="Ads">Ads</mat-option>
                            <mat-option value="Purchased Lists">Purchased Lists</mat-option>
                            <mat-option value="Partner's List">Partner's List</mat-option>
                            <mat-option value="Offline Marketing">Offline Marketing</mat-option>
                            <mat-option value="Market Research">Market Research</mat-option>
                            <mat-option value="Survey Form">Survey Form</mat-option>
                            <mat-option value="Other Means">Other Means</mat-option>
                        </mat-select>
                        <mat-error *ngIf="prospectContactForm.get('prospectSource')?.hasError('required') ">
                            This field is required.  
                        </mat-error> 
                    </mat-form-field>
                </div>


                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Short Remark/Comment</mat-label>
                        <textarea matInput formControlName="prospectRemark"></textarea>
                    </mat-form-field>
                </div>

                <div style="border: 1px dotted rgb(235, 235, 235); width: 100%; margin: 1em 0 2em 0;"></div>


                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Consultation Topic/Reason  </mat-label>
                        <mat-select formControlName="reason">
                        <mat-option value=" Investment Strategy"> Investment Strategy</mat-option>
                        <mat-option value="Cashflow Management">Cashflow Management</mat-option>
                        <mat-option value="Wealth Mindset">Wealth Mindset</mat-option>
                        <mat-option value="Business Guidance">Business Guidance</mat-option>
                        <mat-option value="General Financial Planning">General Financial Planning</mat-option>
                        <mat-option value="About Diamond Project Business">About Diamond Project Business</mat-option>
                        <mat-option value="cant say">Can't say</mat-option>
                        </mat-select>
                        <mat-error *ngIf="prospectContactForm.get('reason')?.hasError('required') ">
                            This answer is required
                        </mat-error>
                    </mat-form-field>
                </div>

                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Preferred Contact Method </mat-label>
                        <mat-select formControlName="contactMethod">
                        <mat-option value="Email">Email</mat-option>
                        <mat-option value="Phone">Phone</mat-option>
                        <mat-option value="WhatsApp">WhatsApp</mat-option>
                        <mat-option value="Text Message">Text Message</mat-option>
                        <mat-option value="Video Call">Video Call (Zoom, Google Meet, etc.)</mat-option>
                        <mat-option value="Any Option">Any Option</mat-option>
                        </mat-select>
                        <mat-error *ngIf="prospectContactForm.get('contactMethod')?.hasError('required') ">
                        This answer is required
                        </mat-error>
                    </mat-form-field>
                </div>
    
                  <div class="none-form-group">
                    <mat-form-field appearance="outline">
                        <mat-label> Leave a brief Description/Questions (Optional)</mat-label>
                        <textarea matInput formControlName="description"></textarea>
                    </mat-form-field>
                  </div>

                  <div class="form-group">
                    <!-- date -->
                    <mat-form-field appearance="outline">
                        <mat-label>Choose a date</mat-label>
                        <input matInput [matDatepicker]="picker" formControlName="consultDate" [min]="minDate">
                        <mat-hint>MM/DD/YYYY</mat-hint>
                        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                        <mat-error *ngIf="prospectContactForm.get('consultDate')?.hasError('required') ">
                            Date is required
                          </mat-error>
                      </mat-form-field>

                    </div>

                  <div class="form-group">
                      <mat-form-field appearance="outline">
                          <mat-label>Choose a time</mat-label>
                          <input matInput type="time" formControlName="consultTime">
                          <mat-hint>HH/MM/am/pm</mat-hint>
                          <mat-error *ngIf="prospectContactForm.get('consultTime')?.hasError('required') ">
                              Time is required
                          </mat-error>
                      </mat-form-field>
                  </div>


                <div class="form-group"></div>


                <button mat-flat-button color="primary">Save Booking</button>
            </form>
        </div>

    </section>
</section>

`,
styles: [`

.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
        height: 100%;
        padding: 1em;
        .title {
            border-bottom: 1px solid #ccc;
            padding: 1em;
            display: flex;
            flex-direction: column;  
            //align-items: center; /* Vertically center the items */  
            justify-content: flex-start; 
            .control {
                display: flex;
                justify-content: space-between;
                .back {
                    cursor: pointer;
                }
                .back:hover {
                    cursor: pointer;
                    opacity: 0.5;
    
                }
            }

           
            h3 {
                margin-top: 1em; 
            }
        }

        .search {
            padding: 0.5em 0;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
        }       

        .no-campaign {
            text-align: center;
            color: rgb(196, 129, 4);
            font-weight: bold;
        }
    }
}

.form-container {
    margin-top: 1em;
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    .flex-form {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        .form-group {
            flex: 1 1 calc(50% - 20px); /* Adjusting for gap space */
            display: flex;
            flex-direction: column;
        } 
        .none-form-group {
            flex: 1 1 100%;
            display: flex;
            flex-direction: column;
        }   
    }
}


@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

`],
})
export class BookSessionComponent implements OnInit, OnDestroy {
    @Input() prospect!: ContactsInterface | any;
    readonly dialog = inject(MatDialog);
    @Input() partner!: PartnerInterface;
    prospectContactForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    minDate = new Date(); // Today's date

    constructor(
      private contactsService: ContactsService,
      private router: Router,
      private location: Location,
    ) {}


    ngOnInit(): void {

        if (this.prospect) {

          this.prospectContactForm = new FormGroup({
            prospectName: new FormControl({value: this.prospect?.prospectName, disabled: true}, Validators.required),
            prospectSurname: new FormControl({value: this.prospect?.prospectSurname, disabled: true}, Validators.required),
            prospectEmail: new FormControl({value:this.prospect?.prospectEmail, disabled: true}, Validators.required),
            prospectPhone: new FormControl({value:this.prospect?.prospectPhone, disabled: true}, Validators.required),
            prospectSource: new FormControl({value:this.prospect?.prospectSource, disabled: true}, Validators.required),
            prospectRemark: new FormControl({value:this.prospect?.prospectRemark, disabled: true}),
            prospectId: new FormControl(this.prospect?._id),
            reason: new FormControl('', Validators.required),
            description: new FormControl(''),
            consultDate: new FormControl('', Validators.required),
            consultTime: new FormControl('', Validators.required),
            contactMethod: new FormControl('', Validators.required),
          });
        }
    }

  back(): void {  
    if (window.history.length > 1) {  
        //window.history.back();  
        this.location.back(); // This will take you to the previous page in the history 
    } else {  
        // Redirect to a default route if there's no history  
        this.router.navigateByUrl('dashboard/tools/contacts/list');  
    }  
  }

  onSubmit(): void {

    // Mark all form controls as touched to trigger the display of error messages
    this.markAllAsTouched();

    if (this.prospectContactForm.valid) {
      // Send the form value to your Node.js backend
     //const formData: FormGroup = this.prospectContactForm.value;

     const formData: any = {
      reason: this.prospectContactForm.value.reason,
      description: this.prospectContactForm.value.description,
      //referralCode: req.body.referralCode,
      consultDate: this.prospectContactForm.value.consultDate,
      consultTime: this.prospectContactForm.value.consultTime,
      contactMethod: this.prospectContactForm.value.contactMethod,
      //referral: req.body.referral,
      referral: 'Booked for prospect',
      phone: this.prospect?.prospectPhone,
      email: this.prospect?.prospectEmail,
      surname: this.prospect?.prospectSurname,
      name: this.prospect?.prospectName,
      //userDevice: req.body.userDevice,
      username: this.partner.username,
     }
      this.subscriptions.push(
        this.contactsService.bookSession(formData).subscribe({

          next: (response) => {
              Swal.fire({
                  position: "bottom",
                  icon: 'success',
                  text: response.message, //`Your have successfully updated prospect status`,
                  showConfirmButton: true,
                  confirmButtonColor: "#ffab40",
                  timer: 10000,
              }).then((result) => {
                  this.router.navigate(['/dashboard/prospects/detail', this.prospect?._id]);
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
  }

    // Helper method to mark all form controls as touched
    private markAllAsTouched() {
      Object.keys(this.prospectContactForm.controls).forEach(controlName => {
        this.prospectContactForm.get(controlName)?.markAsTouched();
      });
    }
  

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          Here, you can easily book a virtual or physical session for your prospect
        `},
      });
    }

   // scroll to top when clicked
   scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

    
  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
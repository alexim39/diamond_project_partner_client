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
import { Location } from '@angular/common';  

/**
 * @title Contacts
 */
@Component({
selector: 'async-edit-contatcs',
template: `

<section class="async-background ">
    <h2>Modify Prospect Contact <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">
        <div class="title">
            <div class="control">
                <div class="back" (click)="back()" title="Back">
                    <mat-icon>arrow_back</mat-icon>
                </div>
                <!-- <button mat-raised-button><mat-icon>download</mat-icon>Download</button> -->
            </div>
            <h3>{{prospect?.prospectSurname | titlecase}} {{prospect?.prospectName | titlecase}}'s Details</h3>
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
                        <input matInput type="email" formControlName="prospectSurname" required>
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
                            <mat-option value="Social Media">Social Media</mat-option>
                            <mat-option value="Website">Website</mat-option>
                            <mat-option value="Content Marketing">Content Marketing</mat-option>
                            <mat-option value="Email Marketing">Email Marketing</mat-option>
                            <mat-option value="Networking Events">Networking Events</mat-option>
                            <mat-option value="Search Engine Advertising (SEA)">Search Engine Advertising (SEA)</mat-option>
                            <mat-option value="Pay-Per-Click (PPC)">Pay-Per-Click (PPC)</mat-option>
                            <mat-option value="Purchased Lists">Purchased Lists</mat-option>
                            <mat-option value="Partnerships">Partnerships</mat-option>
                            <mat-option value="Offline Marketing">Offline Marketing</mat-option>
                            <mat-option value="Market Research">Market Research</mat-option>
                            <mat-option value="Contact Recommendation">Contact Recommendation</mat-option>
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


                <div class="form-group"></div>
                <div class="form-group"></div>
                <div class="form-group"></div>
                <button mat-flat-button color="primary">Update</button>
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
    }
}


@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

`],
providers: [ContactsService],
imports: [CommonModule, MatIconModule, RouterModule, MatButtonToggleModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatSelectModule]
})
export class EditContactsComponent implements OnInit, OnDestroy {
    @Input() prospect!: ContactsInterface | any;
    readonly dialog = inject(MatDialog);

    prospectContactForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
      private contactsService: ContactsService,
      private router: Router,
      private location: Location,
    ) {}


    ngOnInit(): void {
        //console.log(this.prospect)

        if (this.prospect) {
          this.prospectContactForm = new FormGroup({
            prospectName: new FormControl(this.prospect?.prospectName, Validators.required),
            prospectSurname: new FormControl(this.prospect?.prospectSurname, Validators.required),
            prospectEmail: new FormControl(this.prospect?.prospectEmail, Validators.required),
            prospectPhone: new FormControl(this.prospect?.prospectPhone, Validators.required),
            prospectSource: new FormControl(this.prospect?.prospectSource, Validators.required),
            prospectRemark: new FormControl(this.prospect?.prospectRemark),
            prospectId: new FormControl(this.prospect?._id),
          });
        }
    }

    back(): void {  
      if (window.history.length > 1) {  
          window.history.back();  
      } else {  
          // Redirect to a default route if there's no history  
          this.router.navigateByUrl('dashboard/manage-contacts');  
      }  
  }

    onSubmit() {
      const prospectObject = this.prospectContactForm.value;
  
      this.subscriptions.push(
        this.contactsService.update(prospectObject).subscribe((res: any) => {
  
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Your contact has been updated successfully',
            showConfirmButton: true,
            confirmButtonColor: "#ffab40",
            timer: 15000,
          }).then((result) => {
            if (result.isConfirmed) {
              //this.router.navigate(['/dashboard/prospect-detail', this.prospect?.data?._id]);
              this.location.back(); // This will take you to the previous page in the history 
            }
          });
  
        }, (error: any) => {
          console.log(error)
          if (error.code == 400) {
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Prospect already exists with this phone number or email',
              showConfirmButton: false,
              timer: 4000
            })
          } else {
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please try again',
              showConfirmButton: false,
              timer: 4000
            })
          }
        })
      )
    }

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          Here, you can easily modify prospect details
        `},
      });
    }

   // scroll to top when clicked
   scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

    
  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
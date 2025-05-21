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
import { ContactsService } from '../contacts.service';
import { MatInputModule } from '@angular/material/input';  
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title Contacts
 */
@Component({
selector: 'async-create-contatcs',
template:   `

<section class="breadcrumb-wrapper">
    <div class="breadcrumb">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Dashboard</a> &gt;
        <a>Tools</a> &gt;
        <a>Contacts</a> &gt;
        <span>Create contacts</span>
    </div>
</section>

<section class="async-background ">
    <h2>Create Prospect Contact List <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">

        <div class="title">
            <h3>New Contact Form</h3>
            <div class="action-area">
                <mat-button-toggle-group>
                    <mat-button-toggle routerLink="../list" routerLinkActive="active" (click)="scrollToTop()" title="View contact list"><mat-icon>list</mat-icon> Contact List</mat-button-toggle>
                    <mat-button-toggle (click)="importContacts()" title="Import Contacts from campain prospect list"><mat-icon>cloud_download</mat-icon> Import Prospect from Online</mat-button-toggle>
                </mat-button-toggle-group>
            </div>
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
                        <input matInput type="email" formControlName="prospectSurname">
                        <mat-error *ngIf="prospectContactForm.get('prospectSurname')?.hasError('required') ">
                            This field is required.  
                        </mat-error> 
                    </mat-form-field>
                </div>

                <div class="form-group">
                    <mat-form-field appearance="outline">
                        <mat-label>Email Address</mat-label>
                        <input matInput formControlName="prospectEmail">
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
                <button mat-flat-button color="primary">Submit</button>
            </form>
        </div>

        
    </section>
    
</section>

`,
providers: [ContactsService],
imports: [CommonModule, MatIconModule, RouterModule, MatButtonToggleModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatSelectModule],
styles: [`

.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .action-area {
                .action {
                    font-weight: bold;
                    margin-top: 1em;
                }
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
})
export class CreateContactsComponent implements OnInit, OnDestroy {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);

    prospectContactForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
      private contactsService: ContactsService,
      private router: Router,
    ) {}


    ngOnInit(): void {
      console.log(this.partner)

      if (this.partner) {
        this.prospectContactForm = new FormGroup({
          prospectName: new FormControl('', Validators.required),
          prospectSurname: new FormControl(''),
          prospectEmail: new FormControl(''),
          prospectPhone: new FormControl('', Validators.required),
          prospectSource: new FormControl('', Validators.required),
          prospectRemark: new FormControl(''),
          partnerId: new FormControl(this.partner._id),
        });
      }
    }

    onSubmit() {
      const prospectObject = this.prospectContactForm.value;
  
      this.subscriptions.push(
        this.contactsService.create(prospectObject).subscribe( {

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
        })
      )
    }

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          Here, you can easily import (from campaign prospect list) or create contact list for your potential prospect
        `},
      });
    }


  importContacts(): void {
    this.scrollToTop();

    const partnerId = this.partner._id;

    Swal.fire({
      title: `Ready to import contacts from online survey list?`,
      text: "This action may take a while!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, import!"
    }).then((result) => {
      if (result.isConfirmed) {
      this.subscriptions.push(
        this.contactsService.import(partnerId).subscribe({

        next: (response) => {
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: response.message,
              showConfirmButton: true,
              timer: 10000,
              confirmButtonColor: "#ffab40",
              confirmButtonText: "View Contacts",
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('dashboard/tools/contacts/list');
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

   // scroll to top when clicked
   scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

    
  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
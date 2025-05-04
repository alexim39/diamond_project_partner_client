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
templateUrl: 'create-contacts.component.html',
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
        this.contactsService.create(prospectObject).subscribe((res: any) => {
  
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Your contact has been created successfully',
            showConfirmButton: true,
            confirmButtonColor: "#ffab40",
            timer: 15000,
          })
  
        }, (error: any) => {
          //console.log(error)
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
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { Subscription } from 'rxjs';
import { EmailService } from '../email.service';
import { Router } from '@angular/router';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ContactsService } from '../../contacts/contacts.service';
import { ExportContactAndEmailService } from '../../../../_common/services/exportContactAndEmail.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title enter-email
 */
@Component({
selector: 'async-enter-email',
template:`

<form (ngSubmit)="onSubmit()" [formGroup]="bulckEmailForm">  
    <mat-form-field appearance="outline" class="sender-id">  
        <mat-label>Email Subject</mat-label>  
        <input matInput placeholder="Ex. Meeting Request: Join Our Online Strategy Discussion on Diamond Project Mentorship - March 15, 2090" formControlName="emailSubject">  
        <mat-error *ngIf="bulckEmailForm.get('emailSubject')?.hasError('required') ">  
            This field is required.  
        </mat-error>   
    </mat-form-field>  

    <mat-form-field appearance="outline" class="email-address">  
      <mat-label>Enter Email Addresses</mat-label>  
      <textarea matInput placeholder="Ex. aleximenwo@async.com, aleximenwo@async.ng, ..." formControlName="prospects"></textarea>  
      <mat-hint align="start"><strong>Separate each email with a comer</strong> </mat-hint>
      <mat-error *ngIf="bulckEmailForm.get('prospects')?.hasError('required') ">  
        At least an email address should be entered  
      </mat-error>  
    </mat-form-field>  

    <mat-form-field appearance="outline" class="email-message">  
        <mat-label>Type Email Messages</mat-label>  
        <textarea matInput placeholder="Email messages here ..." formControlName="emailBody"></textarea>  
        <mat-error *ngIf="bulckEmailForm.get('emailBody')?.hasError('required') ">  
            Enter the email message to be sent   
        </mat-error>  
    </mat-form-field>  

    <button mat-flat-button>Send Email</button>  
</form>

`,
styles: `

form {
    margin: 2em;
    display: flex;
    flex-direction: column;
    align-items: stretch; /* Ensure the items take full width */  

    .sender-id {
        width: 80%;
    }
    .email-address {
        width: 80%;
        height: 10em;
        margin-top: 20px; 
    }
    .email-message {
        width: 80%;
        height: 15em;
        margin-top: 20px; 
    }

    button {
        width: 20em;
        margin-top: 20px; 
        align-self: center; 
    }
}


 /* Media Query for Mobile Responsiveness */
 @media screen and (max-width: 600px) {
    form {
        .sender-id {
            width: 100%;
        }
        .email-message, .email-address {
            width: 100%;
            height: 10em;
        }
        button {
            width: 100%;
        }
    }
}

`,
providers: [ContactsService],
imports: [MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, CommonModule]
})
export class EnterEmailComponent implements OnInit, OnDestroy {
    @Input() partner!: PartnerInterface;
    bulckEmailForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
      private emailService: EmailService,
      private router: Router,
      private contactsService: ContactsService,
      private exportContactAndEmailService: ExportContactAndEmailService
    ) {}

    
    ngOnInit(): void {
      // console.log(this.partner)

      this.subscriptions.push(
        this.exportContactAndEmailService.data$.subscribe(data => {
          const contactEmails: Array<string> = data;

          if (contactEmails) {

              this.bulckEmailForm = new FormGroup({
                emailSubject: new FormControl('', Validators.required),
                prospects: new FormControl(contactEmails, Validators.required),
                emailBody: new FormControl('', Validators.required),
                partnerId: new FormControl(this.partner._id),
              });

          } else {
            this.bulckEmailForm = new FormGroup({
              emailSubject: new FormControl('', Validators.required),
              prospects: new FormControl('', Validators.required),
              emailBody: new FormControl('', Validators.required),
              partnerId: new FormControl(this.partner._id),
            });
          }
         })
      )

     }

    onSubmit() {

        if (this.bulckEmailForm.valid) {   

          const emailObject = this.bulckEmailForm.value;

            this.subscriptions.push(
                this.emailService.sendEmail(emailObject).subscribe({

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
    }


    ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { SMSService } from '../sms.service';
import { Router } from '@angular/router';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { SMSGatewaysService } from '../../../../_common/services/sms.service';
import { ExportContactAndEmailService } from '../../../../_common/services/exportContactAndEmail.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title enter-phone-numbers
 */
@Component({
selector: 'async-enter-phone-numbers',
template: `

<form (ngSubmit)="onSubmit()" [formGroup]="bulckSMSForm">  
    <mat-form-field appearance="outline" class="sender-id">  
        <mat-label>Sender Id</mat-label>  
        <input matInput placeholder="Ex. DiamondProj" maxlength="11" formControlName="senderId" value="C21FG" readonly="true">  
        <mat-error *ngIf="bulckSMSForm.get('senderId')?.hasError('required') ">  
            This field is required.  
        </mat-error>   
    </mat-form-field>  

    <mat-form-field appearance="outline" class="message-phone">  
      <mat-label>Enter Phone Numbers</mat-label>  
      <textarea matInput placeholder="Ex. 08080386208, 09062537816, ..." formControlName="phoneNumbers"></textarea>  
      <mat-hint align="start"><strong>Separate each phone with a comer</strong> </mat-hint>
      <mat-error *ngIf="bulckSMSForm.get('phoneNumbers')?.hasError('required') ">  
        At least a phone number should be entered  
      </mat-error>  
    </mat-form-field>  

    <mat-form-field appearance="outline" class="message-phone">  
        <mat-label>Enter Text Messages</mat-label>  
        <textarea matInput placeholder="Type text messages here ..." formControlName="textMessage" #message maxlength="960"></textarea>  
        <mat-hint align="end"><strong>Pages {{pages}}</strong>, {{message.value.length}} / 160</mat-hint>  
        <mat-error *ngIf="bulckSMSForm.get('textMessage')?.hasError('required') ">  
            Enter the text message to be sent   
        </mat-error>  
    </mat-form-field>  

    <button mat-flat-button>Send SMS</button>  
</form>

`,
styles: `

form {
    margin: 2em;
    display: flex;
    flex-direction: column;
    align-items: stretch; /* Ensure the items take full width */  

    .sender-id {
        width: 20%;
    }
    .message-phone {
        width: 80%;
        height: 10em;
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
        .message-phone {
            width: 100%;
            height: 10em;
        }
        button {
            width: 100%;
        }
    }
}

`,
providers: [SMSService, SMSGatewaysService],
imports: [MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, CommonModule]
})
export class EnterPhoneNumbersComponent implements OnInit, OnDestroy {
  @Input() partner!: PartnerInterface;
  bulckSMSForm!: FormGroup;
  subscriptions: Array<Subscription> = [];

  constructor(
    private smsService: SMSService,
    private router: Router,
    private smsGatewayService: SMSGatewaysService,
    private exportContactAndEmailService: ExportContactAndEmailService
  ) { }


  ngOnInit(): void {
    // console.log(this.partner)

    this.subscriptions.push(
      this.exportContactAndEmailService.data$.subscribe(data => {
        const contactPhoneNumbers: Array<string> = data;

        if (contactPhoneNumbers) {
          this.bulckSMSForm = new FormGroup({
            senderId: new FormControl('C21FG', Validators.required),
            phoneNumbers: new FormControl(contactPhoneNumbers, Validators.required),
            textMessage: new FormControl('', Validators.required),
            //partnerId: new FormControl(this.partner._id),
          });
        } else {
          this.bulckSMSForm = new FormGroup({
            senderId: new FormControl('', Validators.required),
            phoneNumbers: new FormControl('', Validators.required),
            textMessage: new FormControl('', Validators.required),
            //partnerId: new FormControl(this.partner._id),
          });
        }
      })
    )

  }

  get pages(): number {
    const messageLength = this.bulckSMSForm.get('textMessage')?.value.length || 0;
    return Math.ceil(messageLength / 160);
  }

  onSubmit() {

    if (this.bulckSMSForm.valid) {
      const contacts = this.bulckSMSForm.get('phoneNumbers')?.value;
      const formatedphoneNumbers = this.formatPhoneNumbers(contacts);

      // Here you can send the formattedNumbers and form values to your backend  
      //console.log('Sender ID:', this.bulckSMSForm.get('senderId')?.value);  
      //console.log('Formatted Phone Numbers:', formattedNumbers);  
      //console.log('Text Message:', this.bulckSMSForm.get('textMessage')?.value);  

      const bulkSMSObject = {
        senderId: this.bulckSMSForm.get('senderId')?.value,
        phoneNumbers: formatedphoneNumbers,
        textMessage: this.bulckSMSForm.get('textMessage')?.value,
        partnerId: this.partner._id
      }

      // call sms charge method
      this.chargeForSMS(formatedphoneNumbers);

    }
  }

  private chargeForSMS(phoneNumbers: Array<string>) {

    const chargeObject = {
      partnerId: this.partner._id,
      numberOfContacts: phoneNumbers.length,
      pages: this.pages
    }

    this.subscriptions.push(
      this.smsService.bulkSMSCharge(chargeObject).subscribe({

        next: (response) => {
          console.log('sms charge ', response)
          if (response.success) {
            const transactionId = response?.data._id;
            this.callSMSGate(transactionId)
          }
        },
        error (error: HttpErrorResponse) {
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

    const contacts = this.bulckSMSForm.get('phoneNumbers')?.value;
    const formatedphoneNumbers = this.formatPhoneNumbers(contacts);
    const senderId = this.bulckSMSForm.get('senderId')?.value;
    const message = this.bulckSMSForm.get('textMessage')?.value;

    //Here you can send the formattedNumbers and form values to your backend  
    console.log('Sender ID:', this.bulckSMSForm.get('senderId')?.value);  
    console.log('Formatted Phone Numbers:', formatedphoneNumbers);  
    console.log('Text Message:', this.bulckSMSForm.get('textMessage')?.value);

    this.subscriptions.push(

      this.smsGatewayService.send(formatedphoneNumbers, message, senderId).subscribe({

        next: (response) => {
          let status: "success" | "failed" = response.data.status;
          if (response.data.status == 'success') {
            status = "success"
          } else {
            status = "failed"
          }

          const smsObject = {
            partner: this.partner._id,
            prospect: formatedphoneNumbers,
            smsBody: message,
            transactionId: transactionId,
            status,
          }

          this.subscriptions.push(
            this.smsService.saveSMSRecord(smsObject).subscribe({

              next: (response) => {
                  Swal.fire({
                    position: "bottom",
                    icon: 'success',
                    text: response.message,
                    showConfirmButton: false,
                    timer: 10000,
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
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'SMS not sent, there was an error sending SMS',
            showConfirmButton: false,
            timer: 4000
          })
        }
        /* response => {
          //console.log('SMS sent successfully:', response);  

          if (response.data.status == 'success') {
            const smsObject = {
              partner: this.partner._id,
              prospect: formatedphoneNumbers,
              smsBody: message,
              transactionId: transactionId,
              status: "success"
            }
            // record sms to database
            this.subscriptions.push(
              this.contactsService.saveSMSRecord(smsObject).subscribe((smsSave: any) => {
                //console.log('smsSave ',smsSave)

                Swal.fire({
                  position: "bottom",
                  icon: 'success',
                  text: 'SMS sent successfully',
                  showConfirmButton: false,
                  timer: 4000
                });
              })
            )
          } else {
            const smsObject = {
              partner: this.partner._id,
              prospect: formatedphoneNumbers,
              smsBody: message,
              transactionId: transactionId,
              status: "failed"
            }
            // record sms to database
            this.subscriptions.push(
              this.contactsService.saveSMSRecord(smsObject).subscribe((smsSave: any) => {
                //console.log('smsSave ',smsSave)

                Swal.fire({
                  position: "bottom",
                  icon: 'info',
                  text: 'SMS was not sent successfully',
                  showConfirmButton: false,
                  timer: 4000
                });
              })
            )
          }


        },
        (error) => {
          //console.error('Error sending SMS:', error);  
         
        } */
      })
    );
  }


  private formatPhoneNumbers(numbers: string | string[]): string[] {
    // Initialize a Set to ensure uniqueness  
    const uniqueNumbers = new Set<string>();

    // Determine how to process the input based on the provided category  
    let numberArray: string[];

    if (typeof numbers === 'string') {
      // If the category is 'string', split the input string by commas and trim whitespace  
      numberArray = (numbers as string).split(',').map(num => num.trim());
    } else if (Array.isArray(numbers)) {
      // If the category is 'array', ensure that it's properly typed  
      numberArray = (numbers as string[]).map(num => num.trim());
    } else {
      throw new Error('Invalid category. Must be either "string" or "array".');
    }

    numberArray.forEach(number => {
      // Validate and format phone number  
      if (this.isValidNigerianNumber(number)) {
        // Format number to start with +234  
        const formattedNumber = number.startsWith('0')
          ? '+234' + number.slice(1)  // Replace the initial 0 with +234  
          : number.startsWith('+234')
            ? number                       // If it already starts with +234, keep it  
            : '+234' + number;            // Otherwise, prepend +234  
        uniqueNumbers.add(formattedNumber);
      }
    });

    // Return the unique, formatted phone numbers as an array  
    return Array.from(uniqueNumbers);
  }

  private isValidNigerianNumber(number: string): boolean {
    // Simple regex for validating Nigerian phone numbers  
    const regex = /^(0|\+234)[789]\d{9}$/;
    return regex.test(number);
  }


  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

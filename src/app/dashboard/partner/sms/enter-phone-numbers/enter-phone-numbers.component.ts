import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { smsService } from '../sms.service';
import { Router } from '@angular/router';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { SmsService } from '../../../../_common/services/sms.service';
import { ContactsService } from '../../contacts/contacts.service';
import { ExportContactAndEmailService } from '../../../../_common/services/exportContactAndEmail.service';

/**
 * @title enter-phone-numbers
 */
@Component({
    selector: 'async-enter-phone-numbers',
    templateUrl: 'enter-phone-numbers.component.html',
    styleUrl: 'enter-phone-numbers.component.scss',
    providers: [ContactsService],
    imports: [MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, CommonModule]
})
export class EnterPhoneNumbersComponent implements OnInit, OnDestroy {
  @Input() partner!: PartnerInterface;
  bulckSMSForm!: FormGroup;
  subscriptions: Array<Subscription> = [];

  constructor(
    private smsService: smsService,
    private router: Router,
    private smsGatewayService: SmsService,
    private contactsService: ContactsService,
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

      /*  this.subscriptions.push(
           this.smsService.send(bulkSMSObject).subscribe((res: any) => {
     
             Swal.fire({
               position: "bottom",
               icon: 'success',
               text: 'Your bulk SMS has been sent successfully',
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
       ) */
    }
  }

  private chargeForSMS(phoneNumbers: Array<string>) {

    const chargeObject = {
      partnerId: this.partner._id,
      numberOfContacts: phoneNumbers.length,
      pages: this.pages
    }

    this.subscriptions.push(
      this.smsService.bulkSMSCharge(chargeObject).subscribe((smsCharge: any) => {
        //console.log('sms ',smsCharge)
        const transactionId = smsCharge?.data._id;

        // call sms gateway
        this.callSMSGate(transactionId)

      }, (error: any) => {
        //console.log(error)
        if (error.code == 401) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Insufficient balance for transaction, please fund your account.',
            showConfirmButton: false,
            timer: 4000
          })
        } else {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please and try again',
            showConfirmButton: false,
            timer: 4000
          })
        }

      })
    )
  }


  private callSMSGate(transactionId: string) {

    const contacts = this.bulckSMSForm.get('phoneNumbers')?.value;
    const formatedphoneNumbers = this.formatPhoneNumbers(contacts);
    const senderId = this.bulckSMSForm.get('senderId')?.value;
    const message = this.bulckSMSForm.get('textMessage')?.value;

    // Here you can send the formattedNumbers and form values to your backend  
    //console.log('Sender ID:', this.bulckSMSForm.get('senderId')?.value);  
    //console.log('Formatted Phone Numbers:', formattedNumbers);  
    //console.log('Text Message:', this.bulckSMSForm.get('textMessage')?.value);

    this.subscriptions.push(

      this.smsGatewayService.sendSms(formatedphoneNumbers, message, senderId).subscribe(
        response => {
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
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'SMS not sent, there was an error sending SMS',
            showConfirmButton: false,
            timer: 4000
          })
        }
      )
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
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}

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

/**
 * @title enter-email
 */
@Component({
  selector: 'async-enter-email',
  templateUrl: 'enter-email.component.html',
  styleUrl: 'enter-email.component.scss',
  providers: [ContactsService],
  standalone: true,
  imports: [MatInputModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, CommonModule],
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


     /*  if (this.partner) {
        this.bulckEmailForm = new FormGroup({
          emailSubject: new FormControl('', Validators.required),
          prospects: new FormControl('', Validators.required),
          emailBody: new FormControl('', Validators.required),
          partnerId: new FormControl(this.partner._id),
        });
      } */

     }

    onSubmit() {

        if (this.bulckEmailForm.valid) {   

          const emailObject = this.bulckEmailForm.value;

            this.subscriptions.push(
                this.emailService.sendBulkEmail(emailObject).subscribe((res: any) => {
          
                  Swal.fire({
                    position: "bottom",
                    icon: 'success',
                    text: 'Your bulk Email has been sent successfully',
                    showConfirmButton: true,
                    timer: 15000,
                  })
          
                }, (error: any) => {
                  //console.log(error)
                  if (error.code == 404) {
                    Swal.fire({
                      position: "bottom",
                      icon: 'info',
                      text: 'Something went wrong with your account',
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
    }


    ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }
}

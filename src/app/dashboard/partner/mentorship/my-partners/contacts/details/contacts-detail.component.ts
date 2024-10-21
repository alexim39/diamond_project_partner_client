import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import { ContactsInterface, ContactsService, } from '../contacts.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { CollectCodeComponent } from './collect-code.component';
import { Subscription } from 'rxjs';
import { PartnerInterface, PartnerService } from '../../../../../../_common/services/partner.service';
import { MatSnackBar } from '@angular/material/snack-bar';  
import { SmsService } from '../../../../../../_common/services/sms.service';
import { ProspectListInterface } from '../../../../analytics/analytics.service';
import { ProspectResponseComponent } from '../../../../analytics/prospect-list/prospect-response.component';
import { Location } from '@angular/common';  

/** @title Prospect details */
@Component({
  selector: 'async-my-partner-contacts-detail',
  templateUrl: 'contacts-detail.component.html',
  styleUrls: ['contacts-detail.component.scss'],
  standalone: true,
  providers: [ContactsService],
  imports: [
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule, MatButtonModule, 
    MatDividerModule, MatListModule, CommonModule
  ],
})
export class MyPartnerContactsDetailComponent implements OnInit, OnDestroy {

  @Input() prospect!: ContactsInterface;
  @Input() myPartner!: PartnerInterface;
  prospectData!: any; 
  duration!: null | number;

  selectedStatus: string; 
  remark: string; 
  sms: string; 
  emailBody: string; 
  emailSubject: string; 
  readonly dialog = inject(MatDialog);
  subscriptions: Array<Subscription> = [];
  partner!: PartnerInterface;

  
  constructor(
    private router: Router, 
    private location: Location,

    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private partnerService: PartnerService,
    private snackBar: MatSnackBar,
    private smsGatewayService: SmsService,
  ) {
     // You can initialize selectedStatus if needed  
     this.selectedStatus = ''; // Default value or nothing 
     this.remark = ''; // Default value or nothing 
     this.sms = ``; // Default value or nothing 
     this.emailBody = ''; // Default value or nothing 
     this.emailSubject = ''; // Default value or nothing 
  }


 /*  back(): void {
    this.router.navigateByUrl('dashboard/manage-contacts');
    //this.router.navigate(['/dashboard/my-partners-contacts', this.myPartner._id]);
  } */

    back(): void {  
      this.location.back(); // This will take you to the previous page in the history 
    } 

  
  ngOnInit(): void { 
    //console.log(this.prospect.data)
    if (this.prospect.data) {
      this.prospectData = this.prospect.data;
    }

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          //console.log(this.partner)
        },
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    )
   }

   updateProspectStatus() {
    const obj = {status: this.selectedStatus, prospectId: this.prospectData._id } 
    if (!obj.status) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You should select a status before updating!',
        showConfirmButton: false,
        timer: 4000
      })
      return;
    }
    this.subscriptions.push(
      this.contactsService.updateProspectStatus(obj).subscribe((prospectStatus: ContactsInterface) => {
        // this.prospectContact = prospectContact;
        //console.log('prospectContact ',prospectStatus)
        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: `Your have successfully updated prospect status`,
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })
  
      }, (error: any) => {
        //console.log(error)
        Swal.fire({
          position: "bottom",
          icon: 'info',
          text: 'Server error occured, please and try again',
          showConfirmButton: false,
          timer: 4000
        })
      })
    )
   }

   updateProspectRemark() {

    const obj = {remark: this.remark, prospectId: this.prospectData._id } 
    if (!obj.remark) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You should enter new remark before updating!',
        showConfirmButton: false,
        timer: 4000
      })
      return;
    }

    this.subscriptions.push(
      this.contactsService.updateProspectRemark(obj).subscribe((prospectRemark: ContactsInterface) => {
        // this.prospectContact = prospectContact;
        //console.log('prospectContact ',prospectStatus)
        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: `Your have successfully updated remark on for prospect`,
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })
  
      }, (error: any) => {
        //console.log(error)
        Swal.fire({
          position: "bottom",
          icon: 'info',
          text: 'Server error occured, please and try again',
          showConfirmButton: false,
          timer: 4000
        })
      })
    )
   }

   deleteProspect() {
    const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    Swal.fire({
      title: `Are you sure of deleting ${capitalizeFirstLetter(this.prospectData.prospectSurname)} ${capitalizeFirstLetter(this.prospectData.prospectName)}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.subscriptions.push(
          this.contactsService.deleteProspect(this.prospectData._id ).subscribe((prospect: ContactsInterface) => {
            // this.prospectContact = prospectContact;
            //console.log('prospectContact ',prospectStatus)
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: `Your have successfully deleted  ${capitalizeFirstLetter(this.prospectData.prospectSurname)} ${capitalizeFirstLetter(this.prospectData.prospectName)}`,
              showConfirmButton: true,
              confirmButtonColor: "#ffab40",
              timer: 15000,
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('dashboard/manage-contacts');
              }
            });
      
          }, (error: any) => {
            //console.log(error)
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please and try again',
              showConfirmButton: false,
              timer: 4000
            })
          })
        )

      }
    });
  }

  promoteProspectToPartner() {
    const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    //const obj = {prospectId: this.prospectData._id, code: '' } 

    Swal.fire({
      title: `Is ${capitalizeFirstLetter(this.prospectData.prospectSurname)} ${capitalizeFirstLetter(this.prospectData.prospectName)} now your partner?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, promote!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.dialog.open(CollectCodeComponent, {
          data: this.prospectData
        });
      }
    });
  }

  copyLink() {  
    const link = `www.diamondprojectonline.com/${this.partner.username}`;  
    navigator.clipboard.writeText(link).then(() => {  
      this.snackBar.open('Link copied to clipboard!', 'Close', {  
        duration: 2000,  
      });  
    }).catch(err => {  
      console.error('Failed to copy: ', err);  
    });  
  }  

  sendSMS() {

    this.subscriptions.push(
      this.contactsService.signleSMSCharge(this.partner._id ).subscribe((smsCharge: any) => {
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

   this.subscriptions.push(

      this.smsGatewayService.sendSms(this.prospectData.prospectPhone, this.sms).subscribe(  
        response => {  
          //console.log('SMS sent successfully:', response);  

          if (response.data.status == 'success') {
            const smsObject = {
              partner: this.partner._id, 
              prospect: this.prospectData.prospectPhone, 
              smsBody: this.sms,
              transactionId: transactionId,
              status: "success"
            }
            // record sms to database
            this.subscriptions.push(
              this.contactsService.saveSMSRecord(smsObject).subscribe((smsSave: ContactsInterface) => {
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
              prospect: this.prospectData.prospectPhone, 
              smsBody: this.sms,
              transactionId: transactionId,
              status: "failed"
            }
            // record sms to database
            this.subscriptions.push(
              this.contactsService.saveSMSRecord(smsObject).subscribe((smsSave: ContactsInterface) => {
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

  sendEmail() {
    const emailObject = {
      partner: this.partner, 
      prospect: this.prospectData, 
      emailBody: this.emailBody,
      emailSubject: this.emailSubject
    }
    this.subscriptions.push(

      this.contactsService.sendProspectEmail(emailObject).subscribe(  
        response => {  
          //console.log('SMS sent successfully:', response);  
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Email sent successfully',
            showConfirmButton: false,
            timer: 4000
          })
        },  
        error => {  
          //console.error('Error sending SMS:', error);  
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Email not sent, there was an error sending SMS',
            showConfirmButton: false,
            timer: 4000
          })
        }  
      )

    );
  }

  editProspectDetail() {
    //this.router.navigateByUrl('dashboard/edit-contacts', );
    this.router.navigate(['/dashboard/edit-contacts', this.prospectData._id]);
  }

  bookProspectSession() {
    //this.router.navigateByUrl('dashboard/edit-contacts', );
    this.router.navigate(['/dashboard/book-prospect-session', this.prospectData._id]);
  }

  ViewResponse(prospect: ProspectListInterface) {
    this.dialog.open(ProspectResponseComponent, {
      data: prospect
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }


}

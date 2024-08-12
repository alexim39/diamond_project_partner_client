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
import { CommonModule, TitleCasePipe } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import { ContactsInterface, ContactsService } from '../../contacts.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { CollectCodeComponent } from './collect-code.component';
import { Subscription } from 'rxjs';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { MatSnackBar } from '@angular/material/snack-bar';  
import { SmsService } from '../../../../../_common/services/sms.service';

/** @title Prospect details */
@Component({
  selector: 'async-manage-contacts-detail',
  templateUrl: 'manage-contacts-detail.component.html',
  styleUrls: ['manage-contacts-detail.component.scss'],
  standalone: true,
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
export class ManageContactsDetailComponent implements OnInit, OnDestroy {

  @Input() prospect!: ContactsInterface;
  prospectData!: any; 
  duration!: null | number;

  selectedStatus: string; 
  remark: string; 
  sms: string; 
  readonly dialog = inject(MatDialog);
  subscriptions: Array<Subscription> = [];
  partner!: PartnerInterface;

  
  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private partnerService: PartnerService,
    private snackBar: MatSnackBar,
    private smsService: SmsService
  ) {
     // You can initialize selectedStatus if needed  
     this.selectedStatus = ''; // Default value or nothing 
     this.remark = ''; // Default value or nothing 
     this.sms = ''; // Default value or nothing 
  }


  back(): void {
    this.router.navigateByUrl('dashboard/manage-contacts');
  }

  
  ngOnInit(): void { 
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
    /* if (currentBalance < smsCharges) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'Your balance is insufficient; please fund your account',
        showConfirmButton: false,
        timer: 4000
      })
      return;
    } */

    this.subscriptions.push(
      this.contactsService.signleSMSCharge(this.partner._id ).subscribe((smsCharge: ContactsInterface) => {
       /*  console.log('prospectContact ',smsCharge)
        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: `Your have successfully paid `,
          showConfirmButton: true,
          timer: 15000,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('dashboard/manage-contacts');
          }
        }); */

        // call sms gateway
        this.callSMSGate()
  
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

  private callSMSGate() {
   this.subscriptions.push(

      this.smsService.sendSms(this.prospectData.prospectPhone, this.sms).subscribe(  
        response => {  
          //console.log('SMS sent successfully:', response);  
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'SMS sent successfully',
            showConfirmButton: false,
            timer: 4000
          })
        },  
        error => {  
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

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }


}

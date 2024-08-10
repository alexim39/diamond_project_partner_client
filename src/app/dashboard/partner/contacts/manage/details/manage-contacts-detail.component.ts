import { Component, inject, Input, OnInit } from '@angular/core';
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
export class ManageContactsDetailComponent implements OnInit {

  @Input() prospect!: ContactsInterface;
  prospectData!: any; 
  duration!: null | number;

  selectedStatus: string; 
  remark: string; 
  readonly dialog = inject(MatDialog);


  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService
  ) {
     // You can initialize selectedStatus if needed  
     this.selectedStatus = ''; // Default value or nothing 
     this.remark = ''; // Default value or nothing 
  }

  back(): void {
    this.router.navigateByUrl('dashboard/manage-contacts');
  }

  
  ngOnInit(): void { 
    if (this.prospect.data) {
      this.prospectData = this.prospect.data;
    }
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

    }), (error: any) => {
      //console.log(error)
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'Server error occured, please and try again',
        showConfirmButton: false,
        timer: 4000
      })
    }
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

    }), (error: any) => {
      //console.log(error)
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'Server error occured, please and try again',
        showConfirmButton: false,
        timer: 4000
      })
    }
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
    
        }), (error: any) => {
          //console.log(error)
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please and try again',
            showConfirmButton: false,
            timer: 4000
          })
        }

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

       /*  this.contactsService.promoteProspectToPartner(obj).subscribe((prospect: ContactsInterface) => {
          // this.prospectContact = prospectContact;
          //console.log('prospectContact ',prospectStatus)
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: `Your have successfully promoted ${capitalizeFirstLetter(this.prospectData.prospectSurname)} ${capitalizeFirstLetter(this.prospectData.prospectName)} to your partner`,
            showConfirmButton: true,
            timer: 15000,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigateByUrl('dashboard/manage-contacts');
            }
          });
    
        }), (error: any) => {
          //console.log(error)
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please and try again',
            showConfirmButton: false,
            timer: 4000
          })
        } */

      }
    });
  }



}
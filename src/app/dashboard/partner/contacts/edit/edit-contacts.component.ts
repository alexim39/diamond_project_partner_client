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

/**
 * @title Contacts
 */
@Component({
  selector: 'async-edit-contatcs',
  templateUrl: 'edit-contacts.component.html',
  styleUrls: ['edit-contacts.component.scss'],
  standalone: true,
  providers: [ContactsService],
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonToggleModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule,MatInputModule, ReactiveFormsModule,MatSelectModule],
})
export class EditContactsComponent implements OnInit, OnDestroy {
    @Input() prospect!: ContactsInterface | any;
    readonly dialog = inject(MatDialog);

    prospectContactForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    constructor(
      private contactsService: ContactsService,
      private router: Router,
    ) {}


    ngOnInit(): void {
       // console.log(this.partner)

        if (this.prospect.data) {
          this.prospectContactForm = new FormGroup({
            prospectName: new FormControl(this.prospect?.data?.prospectName, Validators.required),
            prospectSurname: new FormControl(this.prospect?.data?.prospectSurname, Validators.required),
            prospectEmail: new FormControl(this.prospect?.data?.prospectEmail, Validators.required),
            prospectPhone: new FormControl(this.prospect?.data?.prospectPhone, Validators.required),
            prospectSource: new FormControl(this.prospect?.data?.prospectSource, Validators.required),
            prospectRemark: new FormControl(this.prospect?.data?.prospectRemark),
            prospectId: new FormControl(this.prospect?.data?._id),
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
            timer: 15000,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/dashboard/prospect-detail', this.prospect?.data?._id]);
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
          Here, you can easily import (from campaign prospect list) or create contact list for your potential prospect
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
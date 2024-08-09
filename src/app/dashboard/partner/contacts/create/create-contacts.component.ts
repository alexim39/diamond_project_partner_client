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

/**
 * @title Contacts
 */
@Component({
  selector: 'async-create-contatcs',
  templateUrl: 'create-contacts.component.html',
  styleUrls: ['create-contacts.component.scss'],
  standalone: true,
  providers: [ContactsService],
  imports: [CommonModule, MatIconModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule,MatInputModule, ReactiveFormsModule,MatSelectModule],
})
export class CreateContactsComponent implements OnInit, OnDestroy {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);

    prospectContactForm!: FormGroup;
    isSpinning = false;
    subscriptions: Array<Subscription> = [];

    constructor(
      private contactsService: ContactsService,
    ) {}


    ngOnInit(): void {
       // console.log(this.partner)

        if (this.partner) {
          this.prospectContactForm = new FormGroup({
            prospectName: new FormControl('', Validators.required),
            prospectSurname: new FormControl('', Validators.required),
            prospectEmail: new FormControl('', Validators.required),
            prospectPhone: new FormControl('', Validators.required),
            prospectSource: new FormControl('', Validators.required),
            prospectRemark: new FormControl(''),
            partnerId: new FormControl(this.partner._id),
          });
        }
    }

    onSubmit() {
      this.isSpinning = true;
      const prospectObject = this.prospectContactForm.value;
  
  
      this.subscriptions.push(
        this.contactsService.create(prospectObject).subscribe((res: any) => {
  
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Your contact has been updated successfully',
            showConfirmButton: true,
            timer: 15000,
          })
          this.isSpinning = false;
  
        }, (error: any) => {
          //console.log(error)
          this.isSpinning = false;
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please try again',
            showConfirmButton: false,
            timer: 4000
          })
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
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Location } from '@angular/common';  

/**
 * @title Contacts
 */
@Component({
    selector: 'async-book-session',
    templateUrl: 'book-session.component.html',
    styleUrls: ['book-session.component.scss'],
    providers: [ContactsService],
    imports: [CommonModule, MatIconModule, RouterModule, MatDatepickerModule, MatNativeDateModule, MatButtonToggleModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, ReactiveFormsModule, MatSelectModule]
})
export class BookSessionComponent implements OnInit, OnDestroy {
    @Input() prospect!: ContactsInterface | any;
    readonly dialog = inject(MatDialog);
    @Input() partner!: PartnerInterface;
    prospectContactForm!: FormGroup;
    subscriptions: Array<Subscription> = [];

    minDate = new Date(); // Today's date

    constructor(
      private contactsService: ContactsService,
      private router: Router,
      private location: Location,
    ) {}


    ngOnInit(): void {
        //console.log(this.prospect)

        if (this.prospect.data) {
          this.prospectContactForm = new FormGroup({
            prospectName: new FormControl({value: this.prospect?.data?.prospectName, disabled: true}, Validators.required),
            prospectSurname: new FormControl({value: this.prospect?.data?.prospectSurname, disabled: true}, Validators.required),
            prospectEmail: new FormControl({value:this.prospect?.data?.prospectEmail, disabled: true}, Validators.required),
            prospectPhone: new FormControl({value:this.prospect?.data?.prospectPhone, disabled: true}, Validators.required),
            prospectSource: new FormControl({value:this.prospect?.data?.prospectSource, disabled: true}, Validators.required),
            prospectRemark: new FormControl({value:this.prospect?.data?.prospectRemark, disabled: true}),
            prospectId: new FormControl(this.prospect?.data?._id),
            reason: new FormControl('', Validators.required),
            description: new FormControl(''),
            consultDate: new FormControl('', Validators.required),
            consultTime: new FormControl('', Validators.required),
            contactMethod: new FormControl('', Validators.required),
          });
        }
    }

    back(): void {  
      if (window.history.length > 1) {  
          //window.history.back();  
          this.location.back(); // This will take you to the previous page in the history 
      } else {  
          // Redirect to a default route if there's no history  
          this.router.navigateByUrl('dashboard/manage-contacts');  
      }  
  }

  onSubmit(): void {

    // Mark all form controls as touched to trigger the display of error messages
    this.markAllAsTouched();

    if (this.prospectContactForm.valid) {
      // Send the form value to your Node.js backend
     //const formData: FormGroup = this.prospectContactForm.value;

     const formData: any = {
      reason: this.prospectContactForm.value.reason,
      description: this.prospectContactForm.value.description,
      //referralCode: req.body.referralCode,
      consultDate: this.prospectContactForm.value.consultDate,
      consultTime: this.prospectContactForm.value.consultTime,
      contactMethod: this.prospectContactForm.value.contactMethod,
      //referral: req.body.referral,
      referral: 'Booked for prospect',
      phone: this.prospect?.data?.prospectPhone,
      email: this.prospect?.data?.prospectEmail,
      name: this.prospect?.data?.prospectName,
      surname: this.prospect?.data?.prospectSurname,
      //userDevice: req.body.userDevice,
      username: this.partner.username,
     }
      this.subscriptions.push(
        this.contactsService.bookSurvey(formData).subscribe((res: any) => {
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Session booked successfully. Ensure to meet with prospect at booked date and time',
            showConfirmButton: true,
            confirmButtonColor: "#ffab40",
            timer: 10000,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/dashboard/prospect-detail', this.prospect?.data?._id]);
            }
          });
          //this.router.navigateByUrl('get-started/connected-economy');
        }, (error: Error) => {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please try again',
            showConfirmButton: false,
            timer: 4000
          });
        })
      )
    } else {
     //this.isSpinning = false;
    }
    
  }

    // Helper method to mark all form controls as touched
    private markAllAsTouched() {
      Object.keys(this.prospectContactForm.controls).forEach(controlName => {
        this.prospectContactForm.get(controlName)?.markAsTouched();
      });
    }
  

/*     onSubmit() {
      const prospectObject = this.prospectContactForm.value;
  
      this.subscriptions.push(
        this.contactsService.update(prospectObject).subscribe((res: any) => {
  
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Your contact has been updated successfully',
            showConfirmButton: true,
            confirmButtonColor: "#ffab40",
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
    } */

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          Here, you can easily book a virtual or physical session for prospect
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
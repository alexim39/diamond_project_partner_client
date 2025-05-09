import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ReactiveFormsModule } from '@angular/forms';
import { PartnerInterface, } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProfileService } from '../../profile/profile.service';
import Swal from 'sweetalert2';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProfilePictureUploadComponent } from './profile-image.component';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { Countries, States } from '../../../../_common/services/countries';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * @title profile manager
 */
@Component({
selector: 'async-profile-mgr',
templateUrl: 'profile-mgr.component.html',
styles: [`

.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 1%;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .fund-area {
                .fund {
                    //display: flex;
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.5em 0;
            //display: flex;
            //flex-direction: center;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
        }

       
    }
}

.address-section {
  margin: 0 auto;
  border: 1px solid gray;
  padding: 1em;
  border-radius: 5px;
  .address-container {
    display: flex;
    flex-wrap: wrap; // Allow wrapping of items
    gap: 20px; // Add consistent spacing between items
    margin-top: 20px;
    flex-direction: row; // Default to row layout
    justify-content: space-between; // Align items to the left and right

    mat-form-field {
      flex: 1 1 calc(50% - 20px); // Two columns layout with gap adjustment
      min-width: 200px; // Ensure a minimum width for smaller fields
      max-width: 100%; // Prevent fields from exceeding container width
    }
  }

  // Mobile responsiveness
  @media (max-width: 600px) {
    .address-section {
      .address-container {
        display: flex;
        flex-direction: column; // Stack items vertically
        gap: 15px; // Adjust gap for smaller screens

        mat-form-field {
          flex: 1 1 100%; // Full width for mobile devices
          min-width: unset; // Remove minimum width constraint
        }
      }
    }
  }
}



.form-container {
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;

    .flex-form {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;

        .form-group {
            flex: 1 1 calc(50% - 20px); /* Two-column layout with gap adjustment */
            display: flex;
            flex-direction: column;
        }

        .form-ungroup {
            flex: 1 1 100%; /* Take up the full width */
            display: flex;
            flex-direction: column;
        }
    }
}

// Mobile responsiveness
@media (max-width: 600px) {
    .flex-form {
        .form-group,
        .form-ungroup {
            flex: 1 1 100%; /* Full width for mobile devices */
        }
    }
}

`],
providers: [provideNativeDateAdapter(), ProfileService],
imports: [FormsModule, CommonModule, MatSlideToggleModule, MatDatepickerModule, MatExpansionModule, MatProgressBarModule,
    ReactiveFormsModule, MatButtonToggleModule, MatFormFieldModule, MatSelectModule, MatTableModule, MatInputModule, MatIconModule, MatButtonModule, ProfilePictureUploadComponent
]
})
export class ProfileMgrComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);
  @Input() partner!: PartnerInterface;
  profileMgrForm!: FormGroup;
  usernameForm!: FormGroup;
  passwordForm!: FormGroup;
  professionalForm!: FormGroup;
  hideCurrent = signal(true);
  hideNew = signal(true);

  subscriptions: Array<Subscription> = [];
  disabled = true;
  status = false;

  minDate!: Date;

  countries: string[] = Countries;
  states: string[] = States;
  isNigeria = true; // Tracks whether the selected country is Nigeria

  constructor(
    private profileService: ProfileService
  ) { }


  onHideCurrent(event: MouseEvent) {
    this.hideCurrent.set(!this.hideCurrent());
    event.stopPropagation();
  }

  onHideNew(event: MouseEvent) {
    this.hideNew.set(!this.hideNew());
    event.stopPropagation();
  }

  ngOnInit() {
    // Set the minimum date to today  
    this.minDate = new Date();

    if (this.partner) {
      this.profileMgrForm = new FormGroup({
        name: new FormControl(this.partner.name, Validators.required),
        surname: new FormControl(this.partner.surname, Validators.required),
        //address: new FormControl(this.partner.address),
        address: new FormGroup({
          street: new FormControl(this.partner?.address?.street, Validators.required),
          city: new FormControl(this.partner?.address?.city, Validators.required),
          state: new FormControl(this.partner?.address?.state, Validators.required),
          country: new FormControl(this.partner?.address?.country, Validators.required),
        }),
        email: new FormControl(this.partner.email, Validators.required),
        phone: new FormControl(this.partner.phone, Validators.required),
        reservationCode: new FormControl(this.partner.reservationCode, Validators.required),
        dobDatePicker: new FormControl(this.partner.dobDatePicker),
        //status: new FormControl(this.partner.status, Validators.required),
        bio: new FormControl(this.partner.bio),
        id: new FormControl(this.partner._id),
      });
      this.usernameForm = new FormGroup({
        username: new FormControl(this.partner.username, Validators.required),
        id: new FormControl(this.partner._id),
      });
      this.passwordForm = new FormGroup({
        currentPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
        newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
        id: new FormControl(this.partner._id),
      });
      this.professionalForm = new FormGroup({
        jobTitle: new FormControl(this.partner.jobTitle, [Validators.required]),
        educationBackground: new FormControl(this.partner.educationBackground, [Validators.required]),
        hobby: new FormControl(this.partner.hobby, [Validators.required]),
        skill: new FormControl(this.partner.skill, [Validators.required]),
        id: new FormControl(this.partner._id),
      });
      this.status = this.partner.status;

      // user account is already activated,
      if (this.partner.status) {
        // disable slide
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    }
  }

  onToggleChange(event: MatSlideToggleChange) {
    if (event.checked) {
      console.log('Send email');
      // Call your method when checked  
    } else {
      console.log('Do nothing');
      // Call your method when unchecked  
    }
  }

  onProfileSubmit() {
    const profileObject = this.profileMgrForm.value;


    this.subscriptions.push(
      this.profileService.profileUpdate(profileObject).subscribe( {

        next: (response) => {
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: response.message,
            showConfirmButton: true,
            timer: 10000,
            confirmButtonColor: "#ffab40",
          });
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

  onProfessionalSubmit() {
    const professionalForm = this.professionalForm.value;


    this.subscriptions.push(
      this.profileService.professionUpdate(professionalForm).subscribe( {

        next: (response) => {
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: response.message,
            showConfirmButton: true,
            timer: 10000,
            confirmButtonColor: "#ffab40",
          });
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

  onUsernameSubmit() {
    const usernameObject = this.usernameForm.value;

    this.subscriptions.push(
      this.profileService.usernameUpdate(usernameObject).subscribe( {

        next: (response) => {
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: response.message,
            showConfirmButton: true,
            timer: 10000,
            confirmButtonColor: "#ffab40",
          });
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

  onPasswordSubmit() {
    const passwordObject = this.passwordForm.value;

    this.subscriptions.push(
      this.profileService.changePassword(passwordObject).subscribe( {

        next: (response) => {
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: response.message,
            showConfirmButton: true,
            timer: 10000,
            confirmButtonColor: "#ffab40",
          });
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

  showDescription () {
    this.dialog.open(HelpDialogComponent, {
      data: {help: `
        Make sure your username, which is part of your unique link, is meaningful and easy to remember. 
        For example, in diamondprojectonline.com/business, "business" is a meaninful and easy to remember username.

        <p>Other examples of good unique link:
          <ul>
            <li>diamondprojectonline.com/join</li>
            <li>diamondprojectonline.com/connect</li>
            <li>diamondprojectonline.com/link</li>
            <li>diamondprojectonline.com/grow</li>
          </ul>
        </p>

        <p>
          Such links can enhance and boost engagement when link is shared
        </p>
      `},
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onCountryChange(selectedCountry: string): void {
    this.isNigeria = selectedCountry === 'Nigeria';

    // Reset the state field when the country changes
    this.profileMgrForm.get('state')?.reset();

    // Update validation for the state field
    if (this.isNigeria) {
      this.profileMgrForm.get('state')?.setValidators([Validators.required]);
    } else {
      this.profileMgrForm.get('state')?.setValidators([Validators.required, Validators.minLength(2)]);
    }
    this.profileMgrForm.get('state')?.updateValueAndValidity();
  }

}
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
import { ProfileService } from '../profile.service';
import Swal from 'sweetalert2';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProfilePictureUploadComponent } from './profile-image.component';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

/**
 * @title profile manager
 */
@Component({
    selector: 'async-profile-mgr',
    templateUrl: 'profile-mgr.component.html',
    styleUrl: 'profile-mgr.component.scss',
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
        address: new FormControl(this.partner.address),
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
      this.profileService.profileUpdate(profileObject).subscribe((res: any) => {

        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: 'Your profile details has been updated successfully',
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })

      }, (error: any) => {
        //console.log(error)
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

  onProfessionalSubmit() {
    const professionalForm = this.professionalForm.value;


    this.subscriptions.push(
      this.profileService.professionUpdate(professionalForm).subscribe((res: any) => {

        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: 'Your professional details has been updated successfully',
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })

      }, (error: any) => {
        //console.log(error)
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

  onUsernameSubmit() {
    const usernameObject = this.usernameForm.value;

    this.subscriptions.push(
      this.profileService.usernameUpdate(usernameObject).subscribe((res: any) => {

        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: 'Your username has been updated successfully',
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })

      }, (error: any) => {
        if (error.code === 400) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'This username is already in use, please try another name',
            showConfirmButton: false,
            timer: 4000
          })
        }
        else {
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

  onPasswordSubmit() {
    const passwordObject = this.passwordForm.value;


    this.subscriptions.push(
      this.profileService.changePassword(passwordObject).subscribe((res: any) => {

        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: 'Your password has been changed successfully',
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })

      }, (error: any) => {
        if (error.code === 402) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Current and new password should not be the same, please try again',
            showConfirmButton: false,
            timer: 4000
          })
        } else if (error.code === 401) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Password must be 6 characters minimum, please try again',
            showConfirmButton: false,
            timer: 4000
          })
        } else {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Something went wrong, please try again',
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
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}
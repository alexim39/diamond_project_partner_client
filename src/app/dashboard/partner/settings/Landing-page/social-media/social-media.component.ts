import { Component, inject, Input, signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';  
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { SocialMediaSettingsService } from './social-media.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * @title Basic expansion panel
 */
@Component({
  selector: 'async-social-media-settings',
  templateUrl: 'social-media.component.html',
  styleUrls: ['social-media.component.scss', 'social-media.mobile.scss'],
  standalone: true,
  imports: [MatExpansionModule, CommonModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule],
  providers: [MatSnackBar, SocialMediaSettingsService]
})
export class SocialMediaSettingsComponent {
  @Input() partner!: PartnerInterface;
  subscriptions: Array<Subscription> = [];

  
  
  whatsappGroupForm!: FormGroup;  
  whatsappChatForm!: FormGroup;  
  facebookForm!: FormGroup;  
  linkedinForm!: FormGroup;  
  youtubeForm!: FormGroup;  
  instagramForm!: FormGroup;  
  tiktokForm!: FormGroup;  
  twitterForm!: FormGroup;  

    constructor(
        private fb: FormBuilder,
        private socialMediaSettingsService: SocialMediaSettingsService,
        private snackBar: MatSnackBar
    ) { }


    ngOnInit(): void {
        //console.log(this.partner)

        this.whatsappGroupForm = this.fb.group({  
            groupLink: ['', [Validators.required, Validators.pattern(/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/)]]  
        });

        this.whatsappChatForm = this.fb.group({  
            groupLink: ['', [Validators.required, Validators.pattern(/^https:\/\/wa\.me\/message\/[A-Za-z0-9]+$/)]]  
        }); 

        this.facebookForm = this.fb.group({  
            profileLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/(www\.)?facebook\.com\/(.*?)(\/)?$/)]]  
        });

        this.linkedinForm = this.fb.group({  
            profileLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9-]+(\/[a-zA-Z0-9-]*)*$/)]]  
        });  

        this.youtubeForm = this.fb.group({  
            profileLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/(www\.)?youtube\.com\/(channel\/[A-Za-z0-9_-]{24}|user\/[A-Za-z0-9_-]+|c\/[A-Za-z0-9_-]+)$/)]]  
        });  

        this.instagramForm = this.fb.group({  
            profileLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._%+-]+\/$/)]]  
        });

        this.tiktokForm = this.fb.group({  
        profileLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/(www\.)?tiktok\.com\/@([A-Za-z0-9._]+)$/)]]  
        }); 

        this.twitterForm = this.fb.group({  
            profileLink: ['', [Validators.required, Validators.pattern(/^https?:\/\/(www\.)?x\.com\/[A-Za-z0-9_]+$/)]]  
        }); 

    }


    onWhatsappGroupSubmit() {  
        if (this.whatsappGroupForm.valid) {  
          //console.log('Form Submitted!', this.whatsappForm.value); 
          
          const updateObject = {
            url:  this.whatsappGroupForm.value.groupLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.whatsappGroupLinkUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your WhatsApp group link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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

        } else {  
          console.log('Form not valid!');  
        }  
      } 


      onWhatsappChatSubmit() {  
        if (this.whatsappChatForm.valid) {  
          //console.log('Form Submitted!', this.whatsappForm.value); 
          
          const updateObject = {
            url:  this.whatsappChatForm.value.groupLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.whatsappGroupChatUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your WhatsApp chat link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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

        } else {  
          console.log('Form not valid!');  
        }  
      } 

      onFacebookSubmit() {  
        if (this.facebookForm.valid) {  
         // console.log('Form Submitted!', this.facebookForm.value);  

         const updateObject = {
            url:  this.facebookForm.value.profileLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.facebookPageUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your Facebook page link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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
        } else {  
          console.log('Form not valid!');  
        }  
      }  

      onLinkedinSubmit() {  
        if (this.linkedinForm.valid) {  
         // console.log('Form Submitted!', this.linkedinForm.value);  

          const updateObject = {
            url:  this.linkedinForm.value.profileLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.linkedinPageUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your LinkedIn page link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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
        } else {  
          console.log('Form not valid!');  
        }  
      }

      onYoutubeSubmit() {  
        if (this.youtubeForm.valid) {  
         // console.log('Form Submitted!', this.youtubeForm.value);  

          const updateObject = {
            url:  this.youtubeForm.value.profileLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.youtubePageUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your Youtube page link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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
        } else {  
          console.log('Form not valid!');  
        }  
      }

      onInstagramSubmit() {  
        if (this.instagramForm.valid) {  
         // console.log('Form Submitted!', this.instagramForm.value);  

          const updateObject = {
            url:  this.instagramForm.value.profileLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.instagramPageUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your Instagram page link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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
        } else {  
          console.log('Form not valid!');  
        }  
      }

      onTiktokSubmit() {  
        if (this.tiktokForm.valid) {  
         // console.log('Form Submitted!', this.tiktokForm.value);  

          const updateObject = {
            url:  this.tiktokForm.value.profileLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.tiktokPageUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your Instagram page link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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
        } else {  
          console.log('Form not valid!');  
        }  
      }

      onTwitterSubmit() {  
        if (this.twitterForm.valid) {  
         // console.log('Form Submitted!', this.twitterForm.value);  

          const updateObject = {
            url:  this.twitterForm.value.profileLink,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.socialMediaSettingsService.twitterPageUpdate(updateObject).subscribe((res: any) => {
      
             /*  Swal.fire({
                position: "bottom",
                icon: 'success',
                text: 'Your profile details has been updated successfully',
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                timer: 15000,
              }) */

                this.snackBar.open('Your Instagram page link has been updated successfully', 'OK', {
                    duration: 3000
                });
      
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
        } else {  
          console.log('Form not valid!');  
        }  
      }
      
      ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => {
          subscription.unsubscribe();
        });
      }
}

import { Component, inject, Input, signal} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';  
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { LandingPageService } from '../landing-page.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * @title Basic expansion panel
 */
@Component({
    selector: 'async-testimonial-writeup-settings',
    templateUrl: 'testimonial-writeup.component.html',
    styleUrls: ['testimonial-writeup.component.scss', 'testimonial-writeup.mobile.scss'],
    imports: [MatExpansionModule, CommonModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatFormFieldModule],
    providers: [MatSnackBar, LandingPageService]
})
export class TestimonialWriteupSettingsComponent {
  @Input() partner!: PartnerInterface;
  subscriptions: Array<Subscription> = [];

  
  
  testimonialForm!: FormGroup;  


    constructor(
        private fb: FormBuilder,
        private landingPageService: LandingPageService,
        private snackBar: MatSnackBar
    ) { }


    ngOnInit(): void {
        //console.log(this.partner)

        this.testimonialForm = this.fb.group({  
          testimonial: ['', [Validators.required]]  
        });

      

    }


    onSubmit() {  
        if (this.testimonialForm.valid) {  
          //console.log('Form Submitted!', this.whatsappForm.value); 
          
          const updateObject = {
            testimonial:  this.testimonialForm.value.testimonial,
            partnerId: this.partner._id
          }

          this.subscriptions.push(
            this.landingPageService.updateTestimonial(updateObject).subscribe((res: any) => {
      
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

      ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => {
          subscription.unsubscribe();
        });
      }
}

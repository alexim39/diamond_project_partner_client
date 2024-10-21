import { CommonModule } from '@angular/common';
import {Component, inject, OnDestroy} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ContactsInterface, codeData, ContactsService } from '../contacts.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';


/**
 * @title Help Dialog
 */
@Component({
  selector: 'async-collect-code-dialog',
  styles: `
  mat-form-field {
    width: 100%;
  }
  `,
  providers: [ContactsService],
  template: `

<h2 mat-dialog-title>{{this.data.prospectName | titlecase}} {{this.data.prospectSurname | titlecase}} Reservation Code</h2>

<mat-dialog-content>
<p>Please provide the reservation or user ID code for this partner</p>
  <mat-form-field appearance="outline">
    <mat-label>Enter Reservation Code</mat-label>
    <input matInput [(ngModel)]="code" placeholder="Eg. 247MK/ATS/AI or NV012652"/>
  </mat-form-field>

</mat-dialog-content>

<mat-dialog-actions>
<button mat-button (click)="close()">Close</button>
<button mat-button (click)="submitCode()">Submit</button>
</mat-dialog-actions>

  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatInputModule, FormsModule, MatFormFieldModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class CollectCodeComponent implements OnDestroy {
  readonly dialogRef = inject(MatDialogRef<CollectCodeComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  code: string; 
  subscription!: Subscription;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService
  ) {
    this.code = ''; // Default value or nothing 
  }

  close(): void {
    this.dialogRef.close();
  }

  submitCode(): void {

    //console.log(this.code)
    const codeData: codeData  = {
      partnerId: this.data.partnerId,
      prospectId: this.data._id,
      code: this.code
    }

    if (!codeData.code) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You should enter the reservation code first',
        showConfirmButton: false,
        timer: 4000
      });
      return;
    }

    const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    
      this.subscription = this.contactsService.promoteProspectToPartner(codeData).subscribe((prospect: ContactsInterface) => {
        // this.prospectContact = prospectContact;
        //console.log('prospectContact ',prospect)
        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: `Your have successfully submitted reservation code for ${capitalizeFirstLetter(this.data.prospectSurname)} ${capitalizeFirstLetter(this.data.prospectName)}`,
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })  
        this.close();
      }, (error: any) => {
        //console.log(error)
        if (error.code == 401) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'This code has already been used',
            showConfirmButton: false,
            timer: 4000
          })
          this.close();
        } else  if (error.code == 400) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'This code has not been approved yet',
            showConfirmButton: false,
            timer: 4000
          })
        }  else {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please and try again',
            showConfirmButton: false,
            timer: 4000
          })
        }
        //this.close();
      })
      
  }


  ngOnDestroy(): void {
    // unsubscribe list
   // this.subscriptions.forEach(subscription => {
      this.subscription.unsubscribe();
   // });
  }
}
import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import { ContactsInterface, ContactsService } from '../../../contacts.service';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { CollectCodeComponent } from '../collect-code.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProspectListInterface } from '../../../../prospects/prospects.service';
import { ProspectResponseComponent } from '../../../../mentorship/my-partners/contacts/details/prospect-response.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';


@Component({
selector: 'async-prospect-actions-panel',
template: `

<article>  
    <h2>Action</h2>  

    <div class="list">
        <h5> Promote to Partner </h5>
        <span class="data">
            <button mat-flat-button [disabled]="prospectData.status === 'Partner'" (click)="promoteProspectToPartner()"><mat-icon>handshake</mat-icon>Promote</button>
        </span>
    </div>
    <mat-divider></mat-divider>

    <div class="list">
        <h5> Edit Prospect Details </h5>
        <span class="data">
            <button mat-flat-button (click)="editProspectDetail()"><mat-icon>edit</mat-icon>Edit</button>
        </span>
    </div>
    <mat-divider></mat-divider>

    <div class="list">
        <h5> Book for Session </h5>
        <span class="data">
            <button mat-flat-button [disabled]="prospectData.status === 'Partner'" (click)="bookProspectSession()"><mat-icon>bookmark_added</mat-icon>Book Prospect</button>
        </span>
    </div>
    <mat-divider></mat-divider>

    <div class="list" *ngIf="prospectData.survey">
        <h5> Survey Response </h5>
        <span class="data">
            <button mat-flat-button (click)="ViewResponse(prospectData)"><mat-icon>quiz</mat-icon>View Survey Response </button>
        </span>
        <mat-divider style="margin-top: 1em;"></mat-divider>
    </div>

    <div class="list">
        <h5> Move Prospect's Record Back to Prospect List </h5>
        <span class="data">
            <button mat-flat-button [disabled]="prospectData.status === 'Partner'" (click)="moveProspectBackToProspectList(prospectData._id)"><mat-icon>replay</mat-icon>Move Back to Survey List</button>
        </span>
        <mat-divider style="margin-top: 1em;"></mat-divider>
    </div>

    <div class="list">
        <h5> Delete Prospect's Record </h5>
        <span class="data">
            <button mat-stroked-button style="color: rgba(223, 10, 10, 0.578)" (click)="deleteProspect()"><mat-icon>delete</mat-icon>Delete</button>
        </span>
    </div>

</article> 


`,
styles: `

.list {
    margin-bottom: 1em;
    h5 {
        color: gray
    }
    .data {
        font-weight: bold;
        .custom-textarea {  
            min-width: 500px;
            min-height: 300px; 
        }
    }
    .info {
        color: gray;
        font-size: 0.9em;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
    .wrap {
        word-wrap: break-word;
        max-width: 10px !important; /* Adjust as needed */
    }
    .copy-link {
       // background-color: gray;
        display: flex;
        justify-content: space-between;
        align-items: center;
        p {
            font-weight: bold;
        }
        mat-icon {
            cursor: pointer;
        }
    }
}

`,
imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule, 
    MatButtonModule,
    MatDividerModule, 
    CommonModule,
],
})
export class ProspectActionsComponent implements OnInit, OnDestroy {
    @Input() prospect!: ContactsInterface;
    prospectData!: any; 

    readonly dialog = inject(MatDialog);

    subscriptions: Array<Subscription> = [];

    constructor(
        private router: Router, 
        private contactsService: ContactsService,
    ) {}


    ngOnInit(): void {     
        if (this.prospect) {
            this.prospectData = this.prospect;
        }
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

    editProspectDetail() {
        this.router.navigate(['/dashboard/prospects/edit', this.prospectData._id]);
    }

    bookProspectSession() {
        this.router.navigate(['/dashboard/prospects/booking', this.prospectData._id]);
    }

     ViewResponse(prospect: ProspectListInterface) {
        this.dialog.open(ProspectResponseComponent, {
        data: prospect
        });
    }


      // Move prospect back to survey list
    moveProspectBackToProspectList(prospectId: string) {

        Swal.fire({
        title: `Are you sure of moving prospect back to survey list?`,
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, move it!"
        }).then((result) => {
        if (result.isConfirmed) {

            this.subscriptions.push(
            this.contactsService.moveProspectBackToSurveyList(prospectId).subscribe({
                next: (response) => {
                Swal.fire({
                    position: "bottom",
                    icon: 'success',
                    text: response.message, //`Your have successfully updated prospect status`,
                    showConfirmButton: true,
                    confirmButtonColor: "#ffab40",
                    timer: 10000,
                }).then((result) => {
                    this.router.navigateByUrl('dashboard/tools/contacts/list', );
                })
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
        });
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
              this.contactsService.deleteProspect(this.prospectData._id ).subscribe({
    
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
        });
    }

    ngOnDestroy() {
        // unsubscribe list
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

}
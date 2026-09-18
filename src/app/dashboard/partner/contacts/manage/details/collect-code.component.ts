import { CommonModule } from '@angular/common';
import {Component, inject, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ContactsInterface, codeData, ContactsService } from '../../contacts.service';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { userError } from '../../../../../core/http/api-error';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule, MatDialogModule, MatInputModule, FormsModule, MatFormFieldModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions]
})
export class CollectCodeComponent implements OnDestroy {
  readonly dialogRef = inject(MatDialogRef<CollectCodeComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  code: string; 
  subscription!: Subscription;
  private partnerSubscription!: Subscription;
  private currentPartner: PartnerInterface | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private partnerService: PartnerService
  ) {
    this.code = ''; // Default value or nothing 
    // Current signed-in partner (dashboard-level shared subject — replays
    // latest, so this resolves even though the dialog opens late). Used
    // only for by/byName attribution on the conversion record.
    this.partnerSubscription = this.partnerService.getSharedPartnerData$.subscribe({
      next: (partner: PartnerInterface | null) => {
        this.currentPartner = partner ?? null;
      }
    });
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

    
      this.subscription = this.contactsService.promoteProspectToPartner({
        prospectId: codeData.prospectId,
        code: codeData.code,
        ...(this.currentPartner?._id ? { by: this.currentPartner._id } : {}),
        ...((this.currentPartner?.name || this.currentPartner?.surname || this.currentPartner?.username)
          ? { byName: [this.currentPartner?.name, this.currentPartner?.surname].filter(Boolean).join(' ') || this.currentPartner?.username }
          : {}),
      }).subscribe((res: any) => {
        const recordedCode: string = res?.data?.code ?? codeData.code;
        //console.log('prospectContact ',res)
        Swal.fire({
          position: "bottom",
          icon: 'success',
          text: `Reservation code ${recordedCode} recorded for ${capitalizeFirstLetter(this.data.prospectSurname)} ${capitalizeFirstLetter(this.data.prospectName)} — share it with them to complete signup.`,
          showConfirmButton: true,
          confirmButtonColor: "#ffab40",
          timer: 15000,
        })
        this.dialogRef.close({ converted: true, code: recordedCode });
      }, (error: any) => {
        // Prefer the server message (400 bad format, 404 unknown prospect,
        // 409 already converted / already recorded); keep legacy branches.
        const serverMessage: string | undefined = error?.error?.message;
        const status: number | undefined = error?.status;
        if (error.code == 401 || status === 401) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: serverMessage ?? 'This code has already been used',
            showConfirmButton: false,
            timer: 4000
          })
          this.close();
        } else if (status === 409) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: serverMessage ?? 'This prospect is already converted or the code is already recorded',
            showConfirmButton: false,
            timer: 4000
          })
        } else  if (error.code == 400 || status === 400) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: userError(error),
            showConfirmButton: false,
            timer: 4000
          })
        }  else {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: userError(error),
            showConfirmButton: false,
            timer: 4000
          })
        }
        //this.close();
      })
      
  }


  ngOnDestroy(): void {
    // unsubscribe list (guarded — dialog may close without submitting)
   // this.subscriptions.forEach(subscription => {
      this.subscription?.unsubscribe();
      this.partnerSubscription?.unsubscribe();
   // });
  }
}
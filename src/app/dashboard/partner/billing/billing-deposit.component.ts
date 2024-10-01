import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PaystackService } from './paystack.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

/**
 * @title Basic Inputs
 */
@Component({
  selector: 'async-biling-amount',
  standalone: true,
  providers: [PaystackService],
  template: `
    <h2 mat-dialog-title>Hi {{partner.surname | titlecase}} {{partner.name | titlecase}}</h2>
    <mat-dialog-content>
    <p>Use the below field to fund your account</p>
    <mat-form-field appearance="outline" floatLabel="always">
        <mat-label>Enter Amount</mat-label>
        <input matInput type="number" [(ngModel)]="amount"placeholder="0" />
        <span matTextPrefix>&#8358;</span>
        <span matTextSuffix>.00</span>
    </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions>
        <button mat-button [mat-dialog-close] cdkFocusInitial (click)="close()">Close</button>
        <button mat-raised-button color="primary" (click)="addFunds()"><mat-icon>add</mat-icon>Add</button>
    </mat-dialog-actions>

  `,
  imports: [FormsModule, MatFormFieldModule, CommonModule, MatIconModule, MatButtonModule, MatInputModule, MatDialogModule],
})
export class BillingDepositComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<BillingDepositComponent>);
  readonly partner = inject<PartnerInterface>(MAT_DIALOG_DATA);
  amount!: number;
  currentBalance = 0;
  subscriptions: Array<Subscription> = [];
  isSpinning = false;

  constructor(
    private paystackService: PaystackService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    //console.log('=',this.partner)
  }

  addFunds() {
    this.paystackService.payWithPaystack(this.partner.email, this.amount, (response) => {
      if (response.status === 'success') {
        // Payment was successful, update the balance
        ///this.currentBalance += 1000; // Update this based on actual transaction amount
        this.confirmPayment(response.reference);
      } else {
        console.log('Payment failed! Please try again.');
      }
    });
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }

  confirmPayment(reference: string) {
    this.subscriptions.push(
      this.paystackService.confirmPayment(reference, this.partner._id).subscribe(res => {
        this.currentBalance = res.partner.balance;
        //console.log('Payment successful and balance updated!',res);
        // reload the page.
        location.reload();

        /*  Swal.fire({
             position: "bottom",
             icon: 'success',
             text: 'Thank you for creating your ad campaign. We will publish this campaign on Facebook soon',
             showConfirmButton: true,
             confirmButtonColor: "#ffab40",
             timer: 15000,
         })
         this.isSpinning = false; */

      }, (error) => {
        console.error('Error confirming payment:', error);

        /*  this.isSpinning = false;
         Swal.fire({
           position: "bottom",
           icon: 'info',
           text: 'Server error occured, please try again',
           showConfirmButton: false,
           timer: 4000
         }) */

      })
    )
  }


  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}

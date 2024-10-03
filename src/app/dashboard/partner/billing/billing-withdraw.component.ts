import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PaystackService } from './paystack.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';

/**
 * @title Basic Inputs
 */
@Component({
  selector: 'async-biling-withdraw',
  standalone: true,
  providers: [PaystackService, MatSnackBar],
  styles: `

  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    mat-icon {
      margin: 1em 1em 0 0;
      cursor: pointer;
    }
    mat-icon:hover {
      opacity: 0.5
    }
  }

.withdraw-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 10px 20px;
  background-color: #f4f4f4;
  border-radius: 8px;
}

.withdraw-container h2 {
  text-align: center;
  margin-bottom: 20px;
}

form label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

form input, form select {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

form input, {
  width: 95% !important;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[disabled] {
  background-color: #aaa;
}


  `,
  template: `


    <div class="header">
      <h2 mat-dialog-title>Hi {{partner.surname | titlecase}} {{partner.name | titlecase}}</h2>

      <mat-icon [mat-dialog-close] cdkFocusInitial (click)="close()">close</mat-icon>
    </div>

    <mat-dialog-content>

    <p>Use the below field to withdraw from your account</p>

    <!-- <mat-form-field appearance="outline" floatLabel="always">
        <mat-label>Enter Amount</mat-label>
        <input matInput type="number" [(ngModel)]="amount"placeholder="0" />
        <span matTextPrefix>&#8358;</span>
        <span matTextSuffix>.00</span>
    </mat-form-field> -->

    <div class="withdraw-container">
  <h2>Withdraw Funds</h2>
  <form [formGroup]="withdrawForm" (ngSubmit)="onSubmit()">
    
    <!-- Bank Dropdown -->
    <label for="bank">Select Bank</label>
    <select formControlName="bank" (change)="onBankChange($event)">
      <option value="" disabled>Select Bank</option>
      <option *ngFor="let bank of banks" [value]="bank.code">{{ bank.name }}</option>
    </select>

    <!-- Account Number Field -->
    <label for="accountNumber">Account Number</label>
    <input
      type="text"
      id="accountNumber"
      formControlName="accountNumber"
      (input)="resolveAccountName()"
      placeholder="Enter Account Number"
    />

    <!-- Account Name Field (Auto-Populated) -->
    <label for="accountName">Account Name</label>
    <input
      type="text"
      id="accountName"
      formControlName="accountName"
      readonly
      placeholder="Account Name will be auto-filled"
    />

    <!-- Amount Field -->
    <label for="amount">Amount to Withdraw</label>
    <input
      type="number"
      id="amount"
      formControlName="amount"
      placeholder="Enter Amount"
    />

    <!-- Submit Button -->
    <button type="submit" [disabled]="withdrawForm.invalid">Withdraw</button>
  </form>
</div>


    </mat-dialog-content>

    <mat-dialog-actions>
        <!-- <button mat-button [mat-dialog-close] cdkFocusInitial (click)="close()">Close</button> -->
        <!-- <button mat-raised-button color="primary" (click)="addFunds()"><mat-icon>add</mat-icon>Add</button> -->

      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
    </mat-dialog-actions>


  `,
  imports: [FormsModule, MatFormFieldModule, MatProgressBarModule, CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatInputModule, MatDialogModule],
})
export class BillingWithdrawComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<BillingWithdrawComponent>);
  readonly partner = inject<PartnerInterface>(MAT_DIALOG_DATA);
 

  withdrawForm: FormGroup;
  banks: any[] = [];
  loading: boolean = false;
  selectedBankName: string = '';
  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private paymentService: PaystackService
  ) {
    // Initialize the form
    this.withdrawForm = this.fb.group({
      bank: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      accountName: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(100)]],
      partnerId: this.partner._id
    });
  }

  ngOnInit(): void {
    this.getBanks();
  }

  // Fetch list of banks using Paystack API or any other provider
  getBanks() {
    this.http.get('https://api.paystack.co/bank').subscribe((response: any) => {
      this.banks = response.data; // Paystack API response for banks
    });
  }

  resolveAccountName() {
    const accountNumber = this.withdrawForm.get('accountNumber')?.value;
    const bankCode = this.withdrawForm.get('bank')?.value;
  
    if (accountNumber && bankCode) {
      this.loading = true;
      
      const headers = new HttpHeaders({
        'Authorization': 'Bearer sk_test_2b176cfecf4bf2bf8ed1de53b55f868dc4ed9127'  // Replace with your Paystack secret key
      });
  
      const url = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;

      this.subscriptions.push(

        this.http.get(url, { headers }).subscribe((response: any) => {
          if (response.status) {
            // Populate the account name field
            this.withdrawForm.patchValue({
              accountName: response.data.account_name
            });
          } else {
            //alert('Account not found');
            this.snackBar.open('Account not found', 'Ok', {duration: 3000});
          }
          this.loading = false;
        }, (error) => {
          console.log(error)
          //alert('Error resolving account name');
          this.loading = false;
        })

      )
    }
  }
  

  // Handle form submission
  onSubmit() {
    this.loading = true;
    if (this.withdrawForm.valid) {
      const formData = this.withdrawForm.value;

      // Add the selected bank name to the formData
      formData.bankName = this.selectedBankName;

      // Proceed with withdrawal logic
      //console.log('Withdrawal request:', formData);


      this.subscriptions.push(
        this.paymentService.withdrawRequest(formData).subscribe(res => {
          //console.log('Payment successful and balance updated!',res);

           Swal.fire({
               position: "bottom",
               icon: 'success',
               text: 'Thank you for the request. Your account will be credited soon',
               showConfirmButton: true,
               confirmButtonColor: "#ffab40",
               timer: 15000,
           }).then((result) => {
            if (result.isConfirmed) {
              // reload the page.
              location.reload();
            }
          });
           this.loading = false;
           this.close();
  
        }, (error) => {
          console.error('Error confirming payment:', error);
          if (error.code == 401) {
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Your balance is insufficient for this request',
              showConfirmButton: false,
              timer: 4000
            });
          } else {
            this.loading = false;
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please try again',
              showConfirmButton: false,
              timer: 4000
            })
          }          
          this.loading = false;
        })
      )
    }
  }

  onBankChange(event: Event) {
    const selectedBankCode = (event.target as HTMLSelectElement).value;
    const selectedBankIndex = (event.target as HTMLSelectElement).selectedIndex;
    const selectedBankName = (event.target as HTMLSelectElement).options[selectedBankIndex].text;
  
    // Store the selected bank name
    this.selectedBankName = selectedBankName;
  
    // Update the form control with the selected bank code
    this.withdrawForm.patchValue({ bank: selectedBankCode });
  
    // Optionally, clear account number and account name when a new bank is selected
    this.withdrawForm.patchValue({
      accountNumber: '',
      accountName: ''
    });
  }


  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }


}

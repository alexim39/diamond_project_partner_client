import {Component, inject, Input, OnInit} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { PaystackService, TransactionInterface } from './paystack.service';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { BillingAmountComponent } from './billing-amount.component';
import { MatDialog } from '@angular/material/dialog';
import { BillingFilterPipe } from './billing-filter.pipe';


/**
 * @title Biling
 */
@Component({
  selector: 'async-billing',
  styleUrl: 'billing.component.scss',
  templateUrl: 'billing.component.html',
  standalone: true,
  providers: [PaystackService],
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatTableModule, MatInputModule, MatIconModule, MatButtonModule, BillingFilterPipe],
})
export class BillingComponent implements OnInit {

  @Input() partner!: PartnerInterface;
  @Input() transactions!: TransactionInterface;
  readonly dialog = inject(MatDialog);

  currentBalance!: number | undefined;// Initial balance

  filterText: string = '';
  displayedColumns: string[] = ['transactionId', 'dateOfPayment', 'amount', 'paymentMethod', 'paymentStatus', 'action'];
  dataSource: Array<any> = [];
  isEmptyRecord = false;



  constructor(private paystackService: PaystackService) {}

  /* private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  } */

  ngOnInit() {
    this.currentBalance = this.partner ? this.partner.balance : 0; 

    if (this.transactions) {
     //console.log('t=',this.transactions)
      this.dataSource = this.transactions.data;//this.shuffleArray(this.transactions.data);
      if (this.transactions?.data.length === 0) {
        this.isEmptyRecord = true;
      }
    }
  }

  addFunds() {
    const dialogRef = this.dialog.open(BillingAmountComponent, {
      data: this.partner,
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('The dialog was closed', result);
    });
  }
  
}
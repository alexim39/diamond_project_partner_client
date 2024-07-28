import {Component} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';


export interface transactionInterface {
  transactionId: string;
  dateOfPayment: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: boolean;
  action?: null;
}

const ELEMENT_DATA: transactionInterface[] = [
  {transactionId: '976768', dateOfPayment: '20/3/2024', amount: 1.0079, paymentMethod: 'H', paymentStatus: true,},
];


/**
 * @title Biling
 */
@Component({
  selector: 'async-billing',
  styleUrl: 'billing.component.scss',
  templateUrl: 'billing.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatTableModule, MatInputModule, MatIconModule, MatButtonModule],
})
export class BillingComponent {
  displayedColumns: string[] = ['transactionId', 'dateOfPayment', 'amount', 'paymentMethod', 'paymentStatus', 'action'];
  dataSource = ELEMENT_DATA;
}
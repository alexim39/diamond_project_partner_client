import {Component} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

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
 * @title Manage Campaign
 */
@Component({
  selector: 'async-manage-campaign',
  templateUrl: 'manage-campaign.component.html',
  styleUrl: 'manage-campaign.component.scss',
  standalone: true,
  imports: [MatSliderModule, MatInputModule, MatFormFieldModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule],
})
export class ManageCampaignComponent {
    displayedColumns: string[] = ['transactionId', 'dateOfPayment', 'amount', 'paymentMethod', 'paymentStatus', 'action'];
    dataSource = ELEMENT_DATA;
}
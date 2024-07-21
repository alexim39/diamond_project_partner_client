import {Component, Input, OnInit} from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NavigationEnd, NavigationStart, Router, RouterModule, } from '@angular/router';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { ManageCampaignInterface } from './manage-campaign.service';
import { CommonModule } from '@angular/common';

/* export interface transactionInterface {
    transactionId: string;
    dateOfPayment: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: boolean;
    action?: null;
  } */
  
 /*  const ELEMENT_DATA: transactionInterface[] = [
    {transactionId: '976768', dateOfPayment: '20/3/2024', amount: 1.0079, paymentMethod: 'H', paymentStatus: true,},
  ]; */
  

/**
 * @title Manage Campaign
 */
@Component({
  selector: 'async-manage-campaign',
  templateUrl: 'manage-campaign.component.html',
  styleUrl: 'manage-campaign.component.scss',
  standalone: true,
  imports: [MatSliderModule, CommonModule, MatInputModule, MatFormFieldModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule],
})
export class ManageCampaignComponent implements OnInit{

  @Input() partner!: PartnerInterface;
  @Input() campaigns!: ManageCampaignInterface;
  dataSource = [];
  isEmptyRecord = false;

  
  
    displayedColumns: string[] = ['transactionId', 'deliveryStatus', 'dateOfPayment', 'amount', 'paymentMethod', 'paymentStatus', 'action'];

    constructor(
      private router: Router,
    ) {}

    ngOnInit (): void {
      if (this.campaigns.data) {
       
        this.dataSource = this.campaigns.data; 
        if (this.campaigns?.data.length === 0){
          this.isEmptyRecord = true;
        } 
      } 
      
    }


     // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  preview(campaign: ManageCampaignInterface) {
    this.router.navigate(['/dashboard/campaign-detail', campaign._id]);
  }
}
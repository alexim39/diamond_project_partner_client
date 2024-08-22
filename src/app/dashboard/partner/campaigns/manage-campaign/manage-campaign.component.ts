import { Component, Input, OnInit } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule, } from '@angular/router';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { CampaignInterface } from './manage-campaign.service';
import { CommonModule } from '@angular/common';
import { CampaignFilterPipe } from './campaign-filter.pipe';

/**
 * @title Manage Campaign
 */
@Component({
  selector: 'async-manage-campaign',
  templateUrl: 'manage-campaign.component.html',
  styleUrl: 'manage-campaign.component.scss',
  standalone: true,
  imports: [MatSliderModule, CommonModule, MatInputModule, MatFormFieldModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule, CampaignFilterPipe],
})
export class ManageCampaignComponent implements OnInit {

  @Input() partner!: PartnerInterface;
  @Input() campaigns!: CampaignInterface;
  dataSource: Array<any> = [];
  isEmptyRecord = false;

  filterText: string = '';

  displayedColumns: string[] = ['transactionId', 'deliveryStatus', 'dateOfPayment', 'amount', 'paymentMethod', 'paymentStatus', 'action'];

  constructor(
    private router: Router,
  ) { }

    ngOnInit(): void {  
      if (this.campaigns.data) {  
        this.dataSource = this.campaigns.data.sort((a, b) => {  
          // Use the getTime() method to compare the Date values  
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();  
        });  
    
        if (this.dataSource.length === 0) {  
          this.isEmptyRecord = true;  
        }  
      }  
    }


  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  preview(id: string) {
    this.router.navigate(['/dashboard/campaign-detail', id]);
  }
}
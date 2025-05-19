import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterModule, } from '@angular/router';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { CampaignInterface } from './manage-campaign.service';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

/**
 * @title Manage Campaign
 */
@Component({
selector: 'async-manage-campaign',
templateUrl: 'manage-campaign.component.html',
styles: `


.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 1%;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .action-area {
                .action {
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.5em 0;
            //display: flex;
            //flex-direction: center;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
        }

        .table {
            padding: 0 1em;
            border-radius: 10px;
            background-color: white;
        }

        .no-campaign {
            text-align: center;
            color: rgb(196, 129, 4);
            font-weight: bold;
        }
    }
}


`,
imports: [MatSliderModule, CommonModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule]
})
export class ManageCampaignComponent implements OnInit {

  @Input() partner!: PartnerInterface;
  @Input() campaigns!: CampaignInterface[];
  
  dataSource = new MatTableDataSource<any>([]);  
  isEmptyRecord = false;

  filterText: string = '';

  displayedColumns: string[] = ['transactionId',  'deliveryStatus', 'budget', 'campaignDates', 'visits', 'progression', 'results', 'publishDate', 'action'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {  
    if (this.campaigns) {  
      //console.log(this.campaigns.data)
      this.dataSource.data = this.campaigns.sort((a: any, b: any) => {  
        // Use the getTime() method to compare the Date values  
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();  
      });  
  
      if (this.dataSource.data.length === 0) {  
        this.isEmptyRecord = true;  
      } 
    }  
      // Custom filter predicate to filter by name
      this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.deliveryStatus.toLowerCase().includes(filter.toLowerCase()) || data.campaignName.toLowerCase().includes(filter.toLowerCase());
    };
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getProgression(campaign: any): number {  
    if (campaign.deliveryStatus === 'Active' && campaign.budget.budgetAmount > 0) {  
      //return (campaign.reach / campaign.adsBudget) * 100;  
      return (campaign.visits / campaign.budget.budgetAmount) * 100;  
    }  
    return 0; // Return 0% if the campaign is not active or budget is not defined  
  } 


  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  preview(id: string) {
    this.router.navigate(['/dashboard/tools/campaigns/detail', id]);
  }
}
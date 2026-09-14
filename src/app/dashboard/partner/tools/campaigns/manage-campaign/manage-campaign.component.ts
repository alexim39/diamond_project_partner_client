import { Component, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
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
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding-bottom: 2em;
    .page-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1em;
        h2 { margin: 0; }
        .head-actions { display: flex; gap: 0.5em; flex-wrap: wrap; }
        .head-actions a { min-height: 44px; }
    }
    .subtitle { margin: 0.25em 0 0; color: var(--dp-muted); max-width: 44em; }
    .async-container {
        background: var(--dp-surface);
        border: 1px solid var(--dp-line);
        border-radius: var(--dp-radius);
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid var(--dp-line);
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
                width: min(70%, 560px);

            }
        }

        .table {
            padding: 0.5em;
            border-radius: var(--dp-radius);
            background: var(--dp-paper);
            border: 1px solid var(--dp-line);
            overflow-x: auto;
        }

        .table table.mat-mdc-table {
            background: transparent;
        }

        .table .mat-mdc-header-cell {
            color: var(--dp-muted);
        }

        .name-cell { font-weight: 600; cursor: pointer; }

        .no-campaign {
            text-align: center;
            color: var(--dp-gold-ink);
            font-weight: bold;
        }

        .empty-card { display: flex; flex-direction: column; align-items: center; gap: 0.5em; text-align: center; background: var(--dp-paper); border: 1px dashed var(--dp-line); border-radius: 14px; padding: 2.5em 1.5em; color: var(--dp-muted); }
        .empty-card mat-icon { font-size: 40px; height: 40px; width: 40px; opacity: 0.6; }
        .empty-card p { margin: 0; max-width: 34em; }
        .empty-card a { min-height: 44px; }
    }
}


`,
changeDetection: ChangeDetectionStrategy.Eager,
imports: [MatSliderModule, CommonModule, MatPaginatorModule, MatInputModule, MatFormFieldModule, RouterModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule]
})
export class ManageCampaignComponent implements OnInit {

  @Input() partner!: PartnerInterface;
  @Input() campaigns!: CampaignInterface[];
  
  dataSource = new MatTableDataSource<any>([]);  
  isEmptyRecord = false;

  filterText: string = '';

  displayedColumns: string[] = ['transactionId',  'deliveryStatus', 'budget', 'campaignDates', 'visits', 'progression', 'publishDate', 'action'];

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

  statusTone(status: string): string {
    switch (String(status ?? '').toLowerCase()) {
      case 'active': return 'dp-status--ok';
      case 'paused': return 'dp-status--warn';
      case 'ended':
      case 'rejected': return 'dp-status--bad';
      default: return 'dp-status--info';
    }
  }


  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  preview(id: string) {
    this.router.navigate(['/dashboard/tools/campaigns/detail', id]);
  }
}
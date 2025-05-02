import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';  
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { ProspectListInterface } from '../prospects.service';
import { LinkAnalyticsDialogComponent } from './campaign-analytics-dialog.component';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';


/**
 * @title Contacts
 */
@Component({
    selector: 'async-campaign-analytics',
    templateUrl: 'campaign-analytics.component.html',
    styleUrls: ['campaign-analytics.component.scss'],
    providers: [],
    imports: [CommonModule, MatIconModule, RouterModule, MatTableModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, MatSelectModule]
})
export class CampaignAnalyticsComponent implements OnInit, OnDestroy  {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);
    @Input() prospectList!: ProspectListInterface;

    subscriptions: Array<Subscription> = [];

    dataSource = new MatTableDataSource<any>([]);  
    isEmptyRecord = false;
  
    filterText: string = '';
  
    displayedColumns: string[] = ['clicks', 'ctr', 'conversion', 'sources', 'location', 'device', 'engagement', 'bounce', 'referrals',  'roi'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
      private router: Router,
    ) {}

 
    ngOnInit(): void {
        if (this.prospectList.data) {  
  
        if (this.dataSource.data.length === 0) {  
          this.isEmptyRecord = true;  
        }  
      }  
      
    }

    ViewResponse(prospect: ProspectListInterface) {
      this.dialog.open(LinkAnalyticsDialogComponent, {
        data: prospect
      });
    } 

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          View and analyze each campaign performance out there on the internet
        `},
      });
    }

    // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

    
  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
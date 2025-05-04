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
import { LinkAnalyticsDialogComponent } from './link-analytics-dialog.component';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';


/**
 * @title Contacts
 */
@Component({
selector: 'async-link-analytics',
templateUrl: 'link-analytics.component.html',
styles: [`

.async-background {
    margin: 2em;
    h2 {
        mat-icon {
            cursor: pointer;
        }
    }
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
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

.form-container {
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    .flex-form {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        .form-group {
            flex: 1 1 calc(50% - 20px); /* Adjusting for gap space */
            display: flex;
            flex-direction: column;
        }    
    }
}


@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

`],
providers: [],
imports: [CommonModule, MatIconModule, RouterModule, MatTableModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, MatSelectModule]
})
export class LinkAnalyticsComponent implements OnInit, OnDestroy  {
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
        console.log(this.prospectList.data)
        console.log(this.partner)
        //this.dataSource.data  = this.prospectList.data  
    
        if (this.dataSource.data.length === 0) {  
          this.isEmptyRecord = true;  
        }  
      }  
      
    }


    ngAfterViewInit() {
      //this.dataSource.paginator = this.paginator;
    }
  


    ViewResponse(prospect: ProspectListInterface) {
      this.dialog.open(LinkAnalyticsDialogComponent, {
        data: prospect
      });
    } 

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          View and analyze how your unique link is performing out there on the internet
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
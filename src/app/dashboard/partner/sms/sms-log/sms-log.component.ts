import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TruncatePipe } from '../../../../_common/pipes/truncate.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SMSDetailDialogComponent } from './sms-detail/sms-detail.component';

@Component({
selector: 'async-sms-log',
templateUrl: 'sms-log.component.html',
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


tr:hover {
    background: whitesmoke;
    cursor: pointer;
}

tr:active {
    background: #efefef;
}

@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

`],
imports: [CommonModule, MatIconModule, TruncatePipe, MatPaginatorModule, RouterModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule,
        MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule]
})
export class SMSLogComponent implements OnInit, OnDestroy, AfterViewInit  {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() smsObject!: any;

  subscriptions: Array<Subscription> = [];
  filteredData: Array<any> = []; // To hold filtered data
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['reference', 'message', 'recipients', 'cost', 'pages', 'status', 'date'];
  dataSource = new MatTableDataSource<any>(); // Use MatTableDataSource for pagination and filtering

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (this.smsObject.data) {
      const sortedData = this.smsObject.data.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      this.dataSource.data = sortedData;

      if (sortedData.length === 0) {
        this.isEmptyRecord = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngAfterViewInit(): void {
    // Link MatPaginator to MatTableDataSource
    this.dataSource.paginator = this.paginator;
  }

  pages(characters: string): number {
    const messageLength = characters.length || 0;
    return Math.ceil(messageLength / 160);
  }

  filterSMS(): void {
    const searchText = this.filterText.toLowerCase().trim();
    this.dataSource.filter = searchText;

    // Update the empty record flag
    this.isEmptyRecord = this.dataSource.filteredData.length === 0;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: `View and manage your SMS to potential prospect`,
      },
    });
  }

  openSMSDetailDialog(smsRecord: any) {
    //console.log(smsRecord)
    this.dialog.open(SMSDetailDialogComponent, {
      data: smsRecord
    });
  }
}

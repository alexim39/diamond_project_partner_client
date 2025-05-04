import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { EmailDetailDialogComponent } from './email-detail/email-detail.component';

@Component({
selector: 'async-email-log',
templateUrl: 'email-log.component.html',
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
providers: [],
imports: [CommonModule, MatIconModule, TruncatePipe, RouterModule, MatPaginatorModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule,
        MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule]
})
export class EmailLogComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() emails!: any;

  subscriptions: Array<Subscription> = [];
  filteredData: Array<any> = []; // To hold filtered data
  dataSource = new MatTableDataSource<any>(); // Use MatTableDataSource for pagination and filtering
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['subject', 'message', 'recipients', 'date',];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (this.emails.data) {
      const sortedData = this.emails.data.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      this.dataSource.data = sortedData;

      if (sortedData.length === 0) {
        this.isEmptyRecord = true;
      }
    }

  }

  ngAfterViewInit(): void {
    // Link MatPaginator to MatTableDataSource
    this.dataSource.paginator = this.paginator;
  }


  filterEmail(): void {
    const searchText = this.filterText.toLowerCase().trim();
    this.dataSource.filter = searchText;

    // Update the empty record flag
    this.isEmptyRecord = this.dataSource.filteredData.length === 0;
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: `View and manage your email to potential prospect`,
      },
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openEmailDetailDialog(emailRecord: any) {
    //console.log(emailRecord)
    this.dialog.open(EmailDetailDialogComponent, {
      data: emailRecord
    });
  }
}

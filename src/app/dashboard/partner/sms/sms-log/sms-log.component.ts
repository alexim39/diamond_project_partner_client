import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
template: `

<section class="breadcrumb-wrapper">
    <div class="breadcrumb">
      <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Dashboard</a> &gt;
      <a>Tools</a> &gt;
      <a>SMS</a> &gt;
      <span>SMS log</span>
    </div>
</section>
  
  <section class="async-background">
    <h2>Manage Bulk SMS List <mat-icon (click)="showDescription()">help</mat-icon></h2>
  
    <section class="async-container">
      <div class="title">
        <div class="control">
              <div class="back" (click)="back()" title="Back">
                  <mat-icon>arrow_back</mat-icon>
              </div>
              <a mat-list-item routerLink="../../sms/new" routerLinkActive="active" (click)="scrollToTop()" title="New SMS" mat-raised-button>
                <mat-icon>add</mat-icon>New SMS
              </a>
        </div>
        <h3>SMS History</h3>
      </div>
  
      <ng-container *ngIf="!isEmptyRecord">
        <div class="search">
          <mat-form-field appearance="outline">
            <mat-label>Filter by sms message</mat-label>
            <input matInput type="search" name="smsFilter" [(ngModel)]="filterText" (input)="filterSMS()" />
          </mat-form-field>
        </div>
  
        <div class="table">
          <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
            <ng-container matColumnDef="reference">
              <th mat-header-cell *matHeaderCellDef> Reference </th>
              <td mat-cell *matCellDef="let element"> {{ element.transaction.reference }} </td>
            </ng-container>
            <ng-container matColumnDef="message">
              <th mat-header-cell *matHeaderCellDef> Message </th>
              <td mat-cell *matCellDef="let element"> {{ element.smsBody | truncate:50 }} </td>
            </ng-container>
            <ng-container matColumnDef="recipients">
              <th mat-header-cell *matHeaderCellDef> Recipients </th>
              <td mat-cell *matCellDef="let element"> {{ element.prospect | truncate:35 }} </td>
            </ng-container>
            <ng-container matColumnDef="cost">
              <th mat-header-cell *matHeaderCellDef> Cost </th>
              <td mat-cell *matCellDef="let element"> {{ element.transaction.amount | currency:'₦':'symbol':'1.2-2' }} </td>
            </ng-container>
            <ng-container matColumnDef="pages">
              <th mat-header-cell *matHeaderCellDef> Pages </th>
              <td mat-cell *matCellDef="let element"> {{ pages(element.smsBody) }} </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let element"> {{ element.status }} </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date </th>
              <td mat-cell *matCellDef="let element"> {{ element.createdAt | date }} </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="openSMSDetailDialog(row)"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 20, 30, 60, 100]" showFirstLastButtons></mat-paginator>
        </div>
      </ng-container>
  
      <ng-container *ngIf="isEmptyRecord">
        <p class="no-campaign">No record available yet</p>
      </ng-container>
    </section>
  </section>
  


`,
styles: [`
  
.async-background {
    margin: 2em;
    .async-container {
        background-color: #dcdbdb;
        border-radius: 10px;
        height: 100%;
        padding: 1em;
        .title {
            border-bottom: 1px solid #ccc;
            padding: 1em;
            display: flex;
            flex-direction: column;  
            //align-items: center; /* Vertically center the items */  
            justify-content: flex-start; 
            .control {
                display: flex;
                justify-content: space-between;
                .back {
                    cursor: pointer;
                }
                .back:hover {
                    cursor: pointer;
                    opacity: 0.5;
    
                }
            }

           
            h3 {
                margin-top: 1em; 
            }
        }

        .search {
            padding: 0.5em 0;
            text-align: center;
            mat-form-field {
                width: 70%;

            }
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
   /*  if (this.smsObject.data) {
      const sortedData = this.smsObject.data.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      this.dataSource.data = sortedData;

      if (sortedData.length === 0) {
        this.isEmptyRecord = true;
      }
    } */
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['smsObject'] && this.smsObject) {
      this.dataSource.data = this.smsObject.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      this.isEmptyRecord = this.smsObject.length === 0;
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

   back(): void {  
      if (window.history.length > 1) {  
          window.history.back();  
      } else {  
          // Redirect to a default route if there's no history  
          this.router.navigate(['/dashboard/tools/sms/new']);
      }  
    }
}

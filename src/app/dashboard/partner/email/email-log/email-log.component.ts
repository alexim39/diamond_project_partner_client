import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
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
template: `

<section class="breadcrumb-wrapper">
    <div class="breadcrumb">
      <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Dashboard</a> &gt;
      <a>Tools</a> &gt;
      <a>Email</a> &gt;
      <span>Email log</span>
    </div>
</section>

<section class="async-background ">
    <h2>Manage Bulk Email List <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">

        <div class="title">
            <h3>Email History</h3>
            <div class="action-area">
                <a mat-list-item routerLink="../../email/new" routerLinkActive="active" (click)="scrollToTop()" title="New SMS" mat-raised-button><mat-icon>add</mat-icon>New Emails</a>
            </div>
        </div>


        <ng-container *ngIf="!isEmptyRecord">

            <div class="search">
                <mat-form-field appearance="outline">
                  <mat-label>Filter by email message</mat-label>
                  <input matInput type="search" name="smsFilter" [(ngModel)]="filterText" (input)="filterEmail()" />
                </mat-form-field>
              </div>

            <div class="table">    
    
                <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
    
                    <!--- Note that these columns can be defined in any order.
                          The actual rendered columns are set as a property on the row definition" -->
                  
                    <ng-container matColumnDef="subject">
                      <th mat-header-cell *matHeaderCellDef> Email Subject </th>
                      <td mat-cell *matCellDef="let element"> {{element.emailSubject | titlecase }} </td>
                    </ng-container>

                    <ng-container matColumnDef="message">
                      <th mat-header-cell *matHeaderCellDef> Email Body </th>
                      <td mat-cell *matCellDef="let element"> {{element.emailBody | truncate:50 }} </td>
                    </ng-container>
                  
                    <ng-container matColumnDef="recipients">
                      <th mat-header-cell *matHeaderCellDef> Recipients </th>
                      <td mat-cell *matCellDef="let element"> {{element.prospects | truncate:35 }} </td>
                    </ng-container>

                    <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef> Date </th>
                        <td mat-cell *matCellDef="let element"> {{element.createdAt | date}} </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="openEmailDetailDialog(row)"></tr>
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
    if (this.emails) {
      const sortedData = this.emails.sort((a: any, b: any) => {
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

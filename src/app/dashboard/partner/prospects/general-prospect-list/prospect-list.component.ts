import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { ProspectService, ProspectListInterface } from '../prospects.service';
import { timeAgo } from '../../../../_common/date-util';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { MaskedProspectResponseComponent } from './masked-prospect-response.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

/**
 * @title Prospect listing
 */
@Component({
selector: 'async-prospect-list',
template: `

<section class="breadcrumb-wrapper">
    <div class="breadcrumb">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Dashboard</a> &gt;
        <a>Prospect Analytics</a> &gt;
        <a>Converstion Analytics</a> &gt;
        <span>Prospect list</span>
    </div>
</section>

<section class="async-background ">
    <h2>Manage General Prospect List <mat-icon (click)="showDescription()">help</mat-icon></h2>

    <section class="async-container">
        <div class="title">
            <h3>General Online Survey List</h3>
            <div class="action-area">
                <mat-button-toggle-group>
                    <mat-button-toggle routerLink="../../tools/contacts/list" routerLinkActive="active" (click)="scrollToTop()" title="View contact list"><mat-icon>view_list</mat-icon> Contact List</mat-button-toggle>
                    <!-- <mat-button-toggle routerLink="../prospect-list" routerLinkActive="active" (click)="scrollToTop()" title="Prospect List"><mat-icon>view_list</mat-icon> Online Prospect Contact</mat-button-toggle> -->
                    <mat-button-toggle routerLink="../../prospects/personal-list" routerLinkActive="active" (click)="scrollToTop()" title="Personal Prospect List"><mat-icon>groups</mat-icon> Personal Prospect List</mat-button-toggle>
                </mat-button-toggle-group>
            </div>
        </div>

        <ng-container *ngIf="!isEmptyRecord">
            <div class="search">
                <mat-form-field appearance="outline">
                    <mat-label>Filter by prospect name</mat-label>
                    <input matInput type="search" name="contactFilter" [(ngModel)]="filterText" (ngModelChange)="applyFilter($event)">
                </mat-form-field>
            </div>
    
            <div class="table">
                <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
                    <ng-container matColumnDef="name">
                        <th mat-header-cell *matHeaderCellDef>
                            <span matTooltip="Not yet moved contact" *ngIf="badgeValue > 0" [matBadge]="badgeValue" matBadgeOverlap="false">Name</span>
                            <span *ngIf="badgeValue === 0">Name</span>
                        </th>
                      <td mat-cell *matCellDef="let element" class="bold-text" style="cursor: pointer;" (click)="ViewResponse(element)" title="View detailed responses"> 
                     <!--  <td mat-cell *matCellDef="let element" class="bold-text"> -->
                        {{element.name | titlecase }} {{element.surname | titlecase}} 
                      </td> 
                    </ng-container>
                  
                    <ng-container matColumnDef="phone">
                      <th mat-header-cell *matHeaderCellDef> Phone </th>
                      <td mat-cell *matCellDef="let element"> {{ maskPhoneNumber(element.phoneNumber) }} </td>
                      <!-- <td mat-cell *matCellDef="let element"> {{element.phoneNumber}} </td> -->
                    </ng-container>
                  
                    <ng-container matColumnDef="email">
                      <th mat-header-cell *matHeaderCellDef> Email </th>
                      <td mat-cell *matCellDef="let element"> {{ maskEmail(element.email.toLowerCase()) }}  </td>
                      <!-- <td mat-cell *matCellDef="let element"> {{element.email | lowercase}} </td> -->
                    </ng-container>
    
                    <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef> Status </th>
                        <td 
                          mat-cell 
                          *matCellDef="let element" 
                          [ngClass]="{'bold-text': element.prospectStatus === 'Moved to Contact'}">
                          {{element.prospectStatus}}
                        </td>
                    </ng-container>

                    <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>  
                            <span matTooltip="Today's prospect" *ngIf="badgeValue > 0" [matBadge]="todaysProsect" matBadgeOverlap="false">Date</span>
                        </th>
                        <td mat-cell *matCellDef="let element"> {{element.createdAt | date}} </td>
                    </ng-container>

                    <ng-container matColumnDef="dateAgo">
                        <th mat-header-cell *matHeaderCellDef> Duration </th>
                        <td mat-cell *matCellDef="let element"> {{ getDateAgo(element) }}  </td>
                    </ng-container>    

                    <ng-container matColumnDef="action">
                        <th mat-header-cell *matHeaderCellDef> Action </th>
                        <td mat-cell *matCellDef="let element" style="cursor: pointer;"> 
                            <button (click)="moveToContact(element._id)" mat-button [disabled]="element.prospectStatus == 'Moved to Contact'">Move to Contact</button>
                        </td>
                    </ng-container>
                  
                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                        [ngClass]="{'moved-to-contact': row.prospectStatus == 'Moved to Contact'}">
                    </tr>
                </table>

                <mat-paginator [pageSizeOptions]="[10, 20, 30, 60, 100]" showFirstLastButtons></mat-paginator>
            </div>
        </ng-container>
        <ng-container *ngIf="isEmptyRecord">
            <p class="no-campaign">No prospect contact available yet</p>
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

.moved-to-contact {
    background-color: #f4f4f4; /* Light green background */
}

.bold-text {
    font-weight: bolder;
}

@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

`],
providers: [ProspectService],
imports: [CommonModule, MatIconModule, RouterModule, MatTooltipModule, MatChipsModule, MatTableModule, MatBadgeModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, MatSelectModule,
  MatButtonToggleModule
]
})
export class ProspectListComponent implements OnInit, OnDestroy {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() prospectList!: ProspectListInterface;

  subscriptions: Array<Subscription> = [];

  dataSource = new MatTableDataSource<any>([]);
  isEmptyRecord = false;

  filterText: string = '';

  displayedColumns: string[] = ['name', 'phone', 'email', 'status', 'date', 'dateAgo', 'action'];
  timeAgoList: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  todaysProsect: number = 0; // Set this value dynamically as needed
  badgeValue: number = 0; // Set this value dynamically as needed

  constructor(
    private prospectService: ProspectService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (this.prospectList.data) {
      this.dataSource.data = this.prospectList.data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (this.dataSource.data.length === 0) {
        this.isEmptyRecord = true;
      }

      this.calculateNewBookings();
      this.calculateBadgeValue();
    }

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.name.toLowerCase().includes(filter.toLowerCase()) || data.surname.toLowerCase().includes(filter.toLowerCase());
    };
  }

  calculateNewBookings(): void {
    const today = new Date().toISOString().split('T')[0];
    this.todaysProsect = this.dataSource.data.filter((item: any) => {
      return item.createdAt.split('T')[0] === today;
    }).length;
  }

  calculateBadgeValue(): void {
    this.badgeValue = this.dataSource.data.filter((item: any) => {
      return item.prospectStatus !== "Moved to Contact";
    }).length;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getDateAgo(element: any): string {
    return timeAgo(new Date(element.createdAt));
  }

 ViewResponse(prospect: ProspectListInterface) {
    this.dialog.open(MaskedProspectResponseComponent, {
      data: {prospect, partner: this.partner}
    });
  }

  moveToContact(prospectId: string): void {
    Swal.fire({
      title: "Are you sure of moving prospect to contact list?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, move it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.scrollToTop();

        const partnerId = this.partner._id;

        this.subscriptions.push(
          this.prospectService.importSingle({ partnerId, prospectId, source: 'website' }).subscribe({
            next: (response) => {
              Swal.fire({
                position: "bottom",
                icon: 'success',
                text: response.message,//`Your have successfully moved prospect to contact list`,
                showConfirmButton: true,
                confirmButtonColor: "#ffab40",
                confirmButtonText: "OK",
                timer: 15000,
              }).then((result) => {
                if (result.isConfirmed) {
                  //this.router.navigateByUrl('dashboard/prospect-list');
                  window.location.reload();
                }
              });
            },
            error: (error: HttpErrorResponse) => {
              let errorMessage = 'Server error occurred, please try again.'; // default error message.
              if (error.error && error.error.message) {
                errorMessage = error.error.message; // Use backend's error message if available.
              }
              Swal.fire({
                position: "bottom",
                icon: 'error',
                text: errorMessage,
                showConfirmButton: false,
                timer: 4000
              });  
            }
          })
        )
      }
    });
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: `View and manage the general online list of your potential prospect`
      },
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  maskPhoneNumber(phone: string): string {
    if (!phone || phone.length <= 3) return phone;
    const visible = phone.slice(-3);
    const masked = '*'.repeat(phone.length - 3);
    return masked + visible;
  }
  
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [localPart, domain] = email.split('@');
    const visible = localPart.slice(-3);
    const masked = '*'.repeat(localPart.length - 3);
    return masked + visible + '@' + domain;
  }

  
}
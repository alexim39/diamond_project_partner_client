import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ClaimLeadDialogComponent } from './claim-lead-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import type { ProspectListInterface } from '../prospects.service';
import { timeAgo } from '../../../../_common/date-util';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';
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
    <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="scrollToTop()">Dashboard</a> &gt;
    <a>Prospects</a> &gt;
    <span>Buy Prospect</span>
  </div>
</section>

<section class="async-background ">
  <h2>Buy Prospect <mat-icon (click)="showDescription()">help</mat-icon></h2>

  <section class="async-container">
    <div class="title">
      <h3>Fresh leads pool</h3>
      <div class="action-area">
        <mat-button-toggle-group>
          <mat-button-toggle routerLink="/dashboard/tools/contacts/new" (click)="scrollToTop()" title="Add someone to your contact list"><mat-icon>person_add</mat-icon> Add someone</mat-button-toggle>
          <mat-button-toggle routerLink="../pipeline" (click)="scrollToTop()" title="My lead pipeline"><mat-icon>filter_alt</mat-icon> My pipeline</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </div>

    @if (!isEmptyRecord) {
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
              @if (badgeValue > 0) {
                <span matTooltip="Not yet claimed" [matBadge]="badgeValue" matBadgeOverlap="false">Name</span>
              }
              @if (badgeValue === 0) {
                <span>Name</span>
              }
            </th>
            <td mat-cell *matCellDef="let element" class="bold-text" style="cursor: pointer;" (click)="ViewResponse(element)" title="View detailed responses">
              <!--  <td mat-cell *matCellDef="let element" class="bold-text"> -->
              {{element.name | titlecase }} {{element.surname | titlecase}}
            </td>
          </ng-container>
          <ng-container matColumnDef="state">
            <th mat-header-cell *matHeaderCellDef> State </th>
            <td mat-cell *matCellDef="let element"> {{ element.state || '—' }} </td>
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
            <td mat-cell *matCellDef="let element">
              @if (element.prospectStatus == 'Moved to Contact') {
                <span class="dp-status dp-status--neutral">Claimed</span>
              } @else {
                <span class="dp-status dp-status--ok">Available</span>
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="dateAgo">
            <th mat-header-cell *matHeaderCellDef> Age </th>
            <td mat-cell *matCellDef="let element"> {{ getDateAgo(element) }}  </td>
          </ng-container>
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef> Action </th>
            <td mat-cell *matCellDef="let element" style="cursor: pointer;">
              <button (click)="claimLead(element._id)" mat-button [disabled]="element.prospectStatus == 'Moved to Contact'">{{ element.prospectStatus == 'Moved to Contact' ? 'Claimed' : 'Claim lead' }}</button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            [ngClass]="{'moved-to-contact': row.prospectStatus == 'Moved to Contact'}">
          </tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 20, 30, 60, 100]" showFirstLastButtons></mat-paginator>
      </div>
    }
    @if (isEmptyRecord && dataSource.data.length === 0) {
      <p class="no-campaign">No prospect contact available yet</p>
    }
  </section>
</section>


`,
styles: [`

.async-background {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding-bottom: 2em;
    h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.4em;
        mat-icon {
            cursor: pointer;
        }
    }
    .async-container {
        background: var(--dp-surface);
        border: 1px solid var(--dp-line);
        border-radius: var(--dp-radius);
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.75em;
            border-bottom: 1px solid var(--dp-line);
            padding: 0.5em 0.5em 1em;
            h3 {
                margin: 0;
            }
            .action-area {
                .action {
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.75em 0;
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

        .table table.mat-mdc-table,
        .table mat-paginator {
            background: transparent;
        }

        .table .mat-mdc-header-cell {
            color: var(--dp-muted);
        }

        .no-campaign {
            text-align: center;
            color: var(--dp-gold-ink);
            font-weight: bold;
        }
    }
}

.form-container {
    padding: 20px;
    background: var(--dp-surface);
    border: 1px solid var(--dp-line);
    border-radius: var(--dp-radius);
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
    background: var(--dp-gold-soft);
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
providers: [],
changeDetection: ChangeDetectionStrategy.Eager,
imports: [CommonModule, MatIconModule, RouterModule, MatTooltipModule, MatChipsModule, MatTableModule, MatBadgeModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, MatSelectModule,
  MatButtonToggleModule
]
})
export class GeneralProspectListComponent implements OnInit, AfterViewInit {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() prospectList!: ProspectListInterface[];

  dataSource = new MatTableDataSource<any>([]);
  isEmptyRecord = false;

  filterText: string = '';

  displayedColumns: string[] = ['name', 'state', 'phone', 'email', 'status', 'dateAgo', 'action'];
  timeAgoList: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  todaysProsect: number = 0; // Set this value dynamically as needed
  badgeValue: number = 0; // Set this value dynamically as needed

  constructor() { }

 ngOnInit(): void {
    if (this.prospectList) {
      this.dataSource.data = this.prospectList.sort((a: any, b: any) => {
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
    // if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    //}
  }

  getDateAgo(element: any): string {
    return timeAgo(new Date(element.createdAt));
  }

  ViewResponse(prospect: ProspectListInterface) {
    this.dialog.open(MaskedProspectResponseComponent, {
      data: { prospect, partnerState: this.partner?.address?.state ?? '' },
    }).afterClosed().subscribe((result: unknown) => {
      const id = (result as { claim?: string } | null)?.claim;
      if (typeof id === 'string' && id) this.claimLead(id);
    });
  }


    claimLead(prospectId: string): void {
      const lead = this.dataSource.data.find((item: ProspectListInterface) => item._id === prospectId);
      if (!lead) return;
      this.dialog.open(ClaimLeadDialogComponent, {
        data: { lead, partnerId: this.partner._id, partnerState: this.partner?.address?.state ?? '' },
      }).afterClosed().subscribe((claimed: unknown) => {
        if (claimed !== true) return;
        this.dataSource.data = this.dataSource.data.filter((item: ProspectListInterface) => item._id !== prospectId);
        this.calculateNewBookings();
        this.calculateBadgeValue();
      });
    }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: `Buy Prospect: claim fresh leads into your pipeline. Claimed leads leave the pool — work them within 7 days or return them.`
      },
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
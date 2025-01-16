import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsService, ProspectListInterface } from '../analytics.service';
import { BookingStatusUpdateComponent } from './prospect-status-update.component';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * @title Prospect booking
 */
@Component({
  selector: 'async-prospect-booking',
  templateUrl: 'prospect-booking.component.html',
  styleUrls: ['prospect-booking.component.scss', 'prospect-booking.mobile.scss'],
  standalone: true,
  providers: [AnalyticsService],
  imports: [CommonModule, MatIconModule, RouterModule, MatTableModule, MatTooltipModule, MatChipsModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, MatSelectModule],
})
export class ProspectBookingComponent implements OnInit, OnDestroy {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() prospectList!: ProspectListInterface;

  subscriptions: Array<Subscription> = [];

  dataSource = new MatTableDataSource<any>([]);
  isEmptyRecord = false;

  filterText: string = '';

  displayedColumns: string[] = ['name', 'phone', 'email', 'status', 'date', 'time'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterStatus: string | null = null;
  filteredContactCount: number = 0;

  dailyBookings: number = 0; // Bookings for today
  weeklyBookings: number = 0; // Bookings for this week
  monthlyBookings: number = 0; // Bookings for this month

  constructor(
    private analyticsService: AnalyticsService,
    private router: Router,
  ) { }


  ngOnInit(): void {
    if (this.prospectList.data) {
      //console.log(this.prospectList.data)
      this.dataSource.data = this.prospectList.data.sort((a, b) => {
        // Use the getTime() method to compare the Date values  
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (this.dataSource.data.length === 0) {
        this.isEmptyRecord = true;
      }

       // Calculate daily, weekly, and monthly bookings
       this.calculateDailyBookings();
       this.calculateWeeklyBookings();
       this.calculateMonthlyBookings();
    }

     // Combined filter predicate to filter by name and status
     this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterValues = JSON.parse(filter);
      const nameMatch = data.name.toLowerCase().includes(filterValues.name.toLowerCase()) || data.surname.toLowerCase().includes(filterValues.name.toLowerCase());
      const statusMatch = data.status.toLowerCase().includes(filterValues.status.toLowerCase());
      return nameMatch && statusMatch;
    };

  }

  private calculateDailyBookings() {
    const today = new Date();
    this.dailyBookings = this.dataSource.data.filter(booking => {
      const createdAt = new Date(booking.createdAt);
      return (
        createdAt.getDate() === today.getDate() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getFullYear() === today.getFullYear()
      );
    }).length;
  }

  private calculateWeeklyBookings() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Get Sunday of the current week

    this.weeklyBookings = this.dataSource.data.filter(booking => {
      const createdAt = new Date(booking.createdAt);
      return createdAt >= startOfWeek && createdAt <= today;
    }).length;
  }

  private calculateMonthlyBookings() {
    const today = new Date();
    this.monthlyBookings = this.dataSource.data.filter(booking => {
      const createdAt = new Date(booking.createdAt);
      return (
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getFullYear() === today.getFullYear()
      );
    }).length;
  }
    
  applyNameFilter(filterValue: string) {
    const filterValues = {
      name: filterValue,
      status: this.filterStatus || ''
    };
    this.dataSource.filter = JSON.stringify(filterValues);
  }

  applyStatusFilter() {
    const filterValues = {
      name: this.filterText || '',
      status: this.filterStatus || ''
    };
    this.dataSource.filter = JSON.stringify(filterValues);
    this.filteredContactCount = this.dataSource.filteredData.length;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }


  ViewResponse(prospect: ProspectListInterface) {
    this.dialog.open(BookingStatusUpdateComponent, {
      data: prospect
    });
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: `
          View and manage your booking sessioin for prospect
        `},
    });
  }

  // scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  getTotalContacts(): number {
    return this.dataSource.data.length;
  }
}
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
  styleUrls: ['prospect-booking.component.scss'],
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

  displayedColumns: string[] = ['name', 'phone', 'email', 'status', 'date', 'time', 'action', 'delete'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterStatus: string | null = null;
  filteredContactCount: number = 0;


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
    }

     // Combined filter predicate to filter by name and status
     this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterValues = JSON.parse(filter);
      const nameMatch = data.name.toLowerCase().includes(filterValues.name.toLowerCase()) || data.surname.toLowerCase().includes(filterValues.name.toLowerCase());
      const statusMatch = data.status.toLowerCase().includes(filterValues.status.toLowerCase());
      return nameMatch && statusMatch;
    };

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


  deleteBooking(id: string) {
    Swal.fire({
      title: "Are you sure of this delete action?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        /*  Swal.fire({
           title: "Deleted!",
           text: "Your file has been deleted.",
           icon: "success"
         }); */

        //const partnerId = this.partner._id;

        this.subscriptions.push(
          this.analyticsService.deleteBookings(id).subscribe((res: any) => {

            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: `Your have successfully deleted booking detail`,
              showConfirmButton: true,
              confirmButtonText: "Ok",
              confirmButtonColor: "#ffab40",
              timer: 15000,
            }).then((result) => {
              if (result.isConfirmed) {
                //this.router.navigateByUrl('dashboard/manage-contacts');
                location.reload();
              }
            });

          }, (error: any) => {
            //console.log(error)
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please try again',
              showConfirmButton: false,
              timer: 4000
            })
          })
        )

      }
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
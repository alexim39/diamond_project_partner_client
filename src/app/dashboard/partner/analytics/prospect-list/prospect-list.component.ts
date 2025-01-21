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
import { AnalyticsService, ProspectListInterface } from '../analytics.service';
import { ProspectResponseComponent } from './prospect-response.component';
import { timeAgo } from '../../../../_common/date-util';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import {MatTooltipModule} from '@angular/material/tooltip';

/**
 * @title Prospect listing
 */
@Component({
  selector: 'async-prospect-list',
  templateUrl: 'prospect-list.component.html',
  styleUrls: ['prospect-list.component.scss'],
  standalone: true,
  providers: [AnalyticsService],
  imports: [CommonModule, MatIconModule, RouterModule, MatTooltipModule, MatChipsModule, MatTableModule, MatBadgeModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule, MatInputModule, MatSelectModule],
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
    private analyticsService: AnalyticsService,
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
    this.dialog.open(ProspectResponseComponent, {
      data: prospect
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
          this.analyticsService.importSingle({ partnerId, prospectId }).subscribe((res: any) => {
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: `Your have successfully moved prospect to contact list`,
              showConfirmButton: true,
              confirmButtonColor: "#ffab40",
              confirmButtonText: "View Contacts",
              timer: 15000,
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('dashboard/manage-contacts');
              }
            });
          }, (error: Error) => {
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, check if prospect has been moved before and try again',
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
        help: `View and manage your online list of your potential prospect`
      },
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}
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
  styleUrls: ['email-log.component.scss'],
  standalone: true,
  providers: [],
  imports: [CommonModule, MatIconModule, TruncatePipe, RouterModule, MatPaginatorModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule,
    MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule],
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
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  openEmailDetailDialog(emailRecord: any) {
    //console.log(emailRecord)
    this.dialog.open(EmailDetailDialogComponent, {
      data: emailRecord
    });
  }
}

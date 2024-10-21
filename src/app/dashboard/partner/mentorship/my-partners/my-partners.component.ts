import { AfterViewInit, Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TruncatePipe } from '../../../../_common/pipes/truncate.pipe';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { ActivateNewPartnerComponent } from './activate-new-partner.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'async-my-partners',
  templateUrl: 'my-partners.component.html',
  styleUrls: ['my-partners.component.scss'],
  standalone: true,
  imports: [
    MatCardModule, ReactiveFormsModule, FormsModule, MatFormFieldModule,
    CommonModule, MatPaginatorModule, MatInputModule,
    MatTableModule,
    MatRadioModule,
    MatIconModule,
    RouterModule,
    MatButtonModule,
    FormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    TruncatePipe
  ],
  providers: [],
})
export class MyPartnersComponent implements OnInit, AfterViewInit {
  @Input() partner!: PartnerInterface;
  @Input() myPartners!: PartnerInterface[];
  subscriptions: Subscription[] = [];
  dataSource = new MatTableDataSource<PartnerInterface>([]);  
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['name', 'phone', 'email', 'code', 'username', 'date', 'manage'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  readonly dialog = inject(MatDialog);

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {
    //console.log(this.myPartners);
    
    // Check if myPartners has data
    if (this.myPartners && this.myPartners.length > 0) {
      // Use data property to set the array as the table's data source
      this.dataSource = new MatTableDataSource<PartnerInterface>(this.myPartners);
      this.dataSource.paginator = this.paginator; // Ensure paginator is set
    } else {
      this.isEmptyRecord = true;
    }
  
    // Custom filter predicate to filter by name
    this.dataSource.filterPredicate = (data: PartnerInterface, filter: string) => {
      return data.name.toLowerCase().includes(filter.toLowerCase()) || 
             data.surname.toLowerCase().includes(filter.toLowerCase());
    };
  }



  
  ngAfterViewInit() {
    // Link the paginator to the data source
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  support(id: string) {
    this.router.navigate(['/dashboard/support-partner', id]);
  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  ActivateNewPartner() {
    this.dialog.open(ActivateNewPartnerComponent, {
      data: this.partner
    });
  }
}

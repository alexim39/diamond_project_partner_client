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
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { ActivateNewPartnerComponent } from './activate-new-partner.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
selector: 'async-my-partners',
templateUrl: 'my-partners.component.html',
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
        border-radius: 1%;
        height: 100%;
        padding: 1em;
        .title {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ccc;
            padding: 1em;
            .fund-area {
                .fund {
                    //display: flex;
                    font-weight: bold;
                    margin-top: 1em;
                }
            }
        }

        .search {
            padding: 0.5em 0;
            //display: flex;
            //flex-direction: center;
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


`],
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
        MatTooltipModule
    ],
    providers: []
})
export class MyPartnersComponent implements OnInit, AfterViewInit {
  @Input() partner!: PartnerInterface;
  @Input() myPartners!: PartnerInterface[];
  subscriptions: Subscription[] = [];
  dataSource = new MatTableDataSource<PartnerInterface>([]);  
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['name', 'phone', 'email', 'code', 'username', 'date'];

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
    this.router.navigate(['/dashboard/mentorship/partners/my-partners/detail', id]);
  }

  // Scroll to top when clicked
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ActivateNewPartner() {
    this.dialog.open(ActivateNewPartnerComponent, {
      data: this.partner
    });
  }
}

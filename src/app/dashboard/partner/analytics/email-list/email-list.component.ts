import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, } from '@angular/forms';
import Swal from 'sweetalert2';
import {MatSelectModule} from '@angular/material/select';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';  
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsService, ProspectListInterface } from '../analytics.service';
import { ProspectResponseComponent } from './email-response.component';
import { timeAgo } from '../../../../_common/date-util';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';


/**
 * @title Contacts
 */
@Component({
  selector: 'async-email-list',
  templateUrl: 'email-list.component.html',
  styleUrls: ['email-list.component.scss'],
  standalone: true,
  providers: [AnalyticsService],
  imports: [CommonModule, MatIconModule, RouterModule, MatTableModule, MatIconModule, MatPaginatorModule, MatFormFieldModule, MatProgressBarModule, MatButtonModule, FormsModule,MatInputModule,MatSelectModule],
})
export class EmailListComponent implements OnInit, OnDestroy  {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);
    @Input() prospectList!: ProspectListInterface;

    subscriptions: Array<Subscription> = [];

    dataSource = new MatTableDataSource<any>([]);  
    isEmptyRecord = false;
  
    filterText: string = '';
  
    displayedColumns: string[] = ['email', 'status', 'date', 'detail', 'action'];
    timeAgoList: string[] = [];  

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
      private analyticsService: AnalyticsService,
      private router: Router,
    ) {}

 
    ngOnInit(): void {
        if (this.prospectList.data) {  
        //console.log(this.prospectList.data)
        this.dataSource.data  = this.prospectList.data.sort((a, b) => {  
          // Use the getTime() method to compare the Date values  
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();  
        });  
    
        if (this.dataSource.data.length === 0) {  
          this.isEmptyRecord = true;  
        }  
      }  
      
      // Custom filter predicate to filter by name
      this.dataSource.filterPredicate = (data: any, filter: string) => {
        return data.name.toLowerCase().includes(filter.toLowerCase()) || data.surname.toLowerCase().includes(filter.toLowerCase());
      };

    }

    applyFilter(filterValue: string) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
    }
  

    getDateAgo(element: any): string {  
      return timeAgo(new Date(element.updatedAt)); // Assuming element.updatedAt holds the date  
    } 


    ViewResponse(prospect: ProspectListInterface) {
      this.dialog.open(ProspectResponseComponent, {
        data: prospect
      });
    }

    moveToContact(prospectId: string): void {
      /* set confirmation dialog */

      Swal.fire({
        title: "Are you sure of moving prospect to contact list?",
        //text: "You won't be able to revert this!",
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
              this.analyticsService.importSingle({partnerId, prospectId}).subscribe((res: any) => {
        
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
        
              }, (error: any) => {
                //console.log(error)
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

    deleteProspect(prospectId: string) {
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
              this.analyticsService.deleteSingle(prospectId).subscribe((res: any) => {
        
                Swal.fire({
                  position: "bottom",
                  icon: 'success',
                  text: `Your have successfully deleted prospect from the system`,
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


    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          View and manage your email list of your potential prospect
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
}
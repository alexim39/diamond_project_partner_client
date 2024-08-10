import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
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
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { ProspectListFilterPipe } from './prospect-list-filter.pipe';
import { AnalyticsService, ProspectListInterface } from '../analytics.service';
import { ProspectResponseComponent } from './prospect-response.component';

/**
 * @title Contacts
 */
@Component({
  selector: 'async-prospect-list',
  templateUrl: 'prospect-list.component.html',
  styleUrls: ['prospect-list.component.scss'],
  standalone: true,
  providers: [AnalyticsService],
  imports: [CommonModule, MatIconModule, RouterModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule, ProspectListFilterPipe, MatButtonModule, FormsModule,MatInputModule,MatSelectModule],
})
export class ProspectListComponent implements OnInit, OnDestroy {
    @Input() partner!: PartnerInterface;
    readonly dialog = inject(MatDialog);
    @Input() prospectList!: ProspectListInterface;

    isSpinning = false;
    subscriptions: Array<Subscription> = [];

    dataSource: Array<any> = [];
    isEmptyRecord = false;
  
    filterText: string = '';
  
    displayedColumns: string[] = ['name', 'phone', 'email',  'date', 'detail', 'action'];

    constructor(
      private analyticsService: AnalyticsService,
      private router: Router,
    ) {}


    ngOnInit(): void {
        if (this.prospectList.data) {  
        //console.log(this.prospectContact.data)
        this.dataSource = this.prospectList.data.sort((a, b) => {  
          // Use the getTime() method to compare the Date values  
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();  
        });  
    
        if (this.dataSource.length === 0) {  
          this.isEmptyRecord = true;  
        }  
      }  
    }


    ViewResponse(prospect: ProspectListInterface) {
      this.dialog.open(ProspectResponseComponent, {
        data: prospect
      });
    }

    moveToContact(prospectId: string): void {
      /* set confirmation dialog */

      Swal.fire({
        title: "Are you sure move prospect to contact list?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, move it!"
      }).then((result) => {
        if (result.isConfirmed) {
          /* Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          }); */

          this.scrollToTop();
  
          this.isSpinning = true;  
          const partnerId = this.partner._id;
        
            this.subscriptions.push(
              this.analyticsService.importSingle({partnerId, prospectId}).subscribe((res: any) => {
        
                Swal.fire({
                  position: "bottom",
                  icon: 'success',
                  text: `Your have successfully move prospect to contact list`,
                  showConfirmButton: true,
                  confirmButtonText: "View Contacts",
                  timer: 15000,
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigateByUrl('dashboard/manage-contacts');
                  }
                });
                this.isSpinning = false;
        
              }, (error: any) => {
                //console.log(error)
                this.isSpinning = false;
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

          this.isSpinning = true;  
          //const partnerId = this.partner._id;
        
            this.subscriptions.push(
              this.analyticsService.deleteSingle(prospectId).subscribe((res: any) => {
        
                Swal.fire({
                  position: "bottom",
                  icon: 'success',
                  text: `Your have successfully deleted prospect from the system`,
                  showConfirmButton: true,
                  confirmButtonText: "Ok",
                  timer: 15000,
                }).then((result) => {
                  if (result.isConfirmed) {
                    //this.router.navigateByUrl('dashboard/manage-contacts');
                    location.reload();
                  }
                });
                this.isSpinning = false;
        
              }, (error: any) => {
                //console.log(error)
                this.isSpinning = false;
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
          View and manage your online list of your potential prospect
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
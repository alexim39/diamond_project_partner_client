import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { ContactsInterface, ContactsService } from '../contacts.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
//import { TruncatePipe } from '../../../../_common/pipes/truncate.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ExportContactAndEmailService } from '../../../../_common/services/exportContactAndEmail.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
selector: 'async-manage-contatcs',
templateUrl: 'manage-contacts.component.html',
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
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            mat-form-field {
                width: 45%;

            }
        }  
        
        .export-button {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
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


@media (max-width: 600px) {
    .form-group {
        flex: 1 1 100%;
    }
}

.partner {  
    background-color: rgb(213, 248, 213); 
    text-decoration: line-through; 
}  

.member {  
    background-color: rgb(255, 182, 182); 
    text-decoration: line-through; 
}

.closing {  
    background-color: rgb(250, 251, 229); 
}

.not-interested {  
    
    background-color: rgb(249, 223, 223);
}

.bold-text {
    font-weight: bolder;
}

.summary-action {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .summary-area {
        display: flex;
        flex-direction: row;
        .mat-chip {
            font-size: 0.8em;
        }
        .value {
            font-weight: bolder;
            font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans';
            font-size: 1.2em;
        }
     
        
    }
}

`],
providers: [ContactsService],
imports: [CommonModule, MatIconModule, RouterModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule,
        MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatTooltipModule, MatCheckboxModule, ReactiveFormsModule, MatPaginatorModule, MatChipsModule]
})
export class ManageContactsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() prospectContact!: ContactsInterface;

  subscriptions: Array<Subscription> = [];

  dataSource = new MatTableDataSource<any>([]);
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['select', 'name', 'phone', 'email', 'channel', 'status', 'date',];

  selection = new Set<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filterStatus: string | null = null;
  filteredContactCount: number = 0;

  dailyNewContacts: number = 0; // Add this property
  weeklyNewContacts: number = 0; // Weekly contacts
  monthlyNewContacts: number = 0; // Monthly contacts

  constructor(
    private contactsService: ContactsService,
    private router: Router,
    private exportContactAndEmailService: ExportContactAndEmailService
  ) { }

  ngOnInit(): void {
    if (this.prospectContact.data) {
      //console.log(this.prospectContact.data)
      this.dataSource.data = this.prospectContact.data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (this.dataSource.data.length === 0) {
        this.isEmptyRecord = true;
      }

     // Calculate daily, weekly, and monthly new contacts
     this.calculateDailyNewContacts();
     this.calculateWeeklyNewContacts();
     this.calculateMonthlyNewContacts();
    }

    // Combined filter predicate to filter by name and status
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterValues = JSON.parse(filter);
      const nameMatch = data.prospectName.toLowerCase().includes(filterValues.name.toLowerCase()) || data.prospectSurname.toLowerCase().includes(filterValues.name.toLowerCase());
      const statusMatch = data.status.toLowerCase().includes(filterValues.status.toLowerCase());
      return nameMatch && statusMatch;
    };
  }

  private calculateDailyNewContacts() {
    const today = new Date();
    this.dailyNewContacts = this.dataSource.data.filter(contact => {
      const createdAt = new Date(contact.createdAt);
      return createdAt.getDate() === today.getDate() &&
              createdAt.getMonth() === today.getMonth() &&
              createdAt.getFullYear() === today.getFullYear();
    }).length;
  }

  private calculateWeeklyNewContacts() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Get the Sunday of the current week

    this.weeklyNewContacts = this.dataSource.data.filter(contact => {
      const createdAt = new Date(contact.createdAt);
      return createdAt >= startOfWeek && createdAt <= today;
    }).length;
  }

  private calculateMonthlyNewContacts() {
    const today = new Date();
    this.monthlyNewContacts = this.dataSource.data.filter(contact => {
      const createdAt = new Date(contact.createdAt);
      return createdAt.getMonth() === today.getMonth() &&
             createdAt.getFullYear() === today.getFullYear();
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

  toggleSelection(element: any) {
    if (this.selection.has(element)) {
      this.selection.delete(element);
    } else {
      this.selection.add(element);
    }
  }

  isAllSelected() {
    return this.selection.size === this.dataSource.data.length;
  }

  isSomeSelected() {
    return this.selection.size > 0 && !this.isAllSelected();
  }

  selectAll(checked: boolean) {
    if (checked) {
      this.selection = new Set(this.dataSource.data);
    } else {
      this.selection.clear();
    }
  }

  private getSelectedPhoneNumbers(): string[] {
    return Array.from(this.selection).map(item => item.prospectPhone);
  }

  private getSelectedEmailAddresses(): string[] {
    return Array.from(this.selection).map(item => item.prospectEmail);
  }

  // Method to handle the change in font style selection  
  onExportControlChange(selectedValue: string): void {
    //console.log('Selected Font Style:', selectedValue);  
    // You can add logic here based on the selected value  
    switch (selectedValue) {
      case 'contacts':
        this.applyContactExport();
        break;
      case 'emails':
        this.applyEmailExport();
        break;
      default:
        break;
    }
  }


  private applyContactExport() {
    // Logic for applying bold style  
    if (this.getSelectedPhoneNumbers().length === 0) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You have not selected any contact phone number yet',
        showConfirmButton: false,
        timer: 4000
      });
    } else {
      // export contacts
      this.exportContactAndEmailService.setData(this.getSelectedPhoneNumbers());
      this.router.navigate(['/dashboard/tools/sms/new']); // redirect to bulk sms page
    }
  }

  private applyEmailExport() {
    // Logic for applying bold style  
    if (this.getSelectedEmailAddresses().length === 0) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You have not selected any contact email address yet',
        showConfirmButton: false,
        timer: 4000
      });
    } else {
      // export contacts
      this.exportContactAndEmailService.setData(this.getSelectedEmailAddresses());
      this.router.navigate(['/dashboard/tools/email/new']); // redirect to bulk email page
    }
  }


  preview(id: string) {
    this.router.navigate(['/dashboard/prospects/detail', id]);
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: `View and manage your imported or created contact list of your potential prospect`,
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

  getTotalContacts(): number {
    return this.dataSource.data.length;
  }

  getTotalOnlineContacts(): number {
    //console.log(this.dataSource.data)
    return this.dataSource.data.filter(contact => contact.prospectSource === 'Unique Link').length;
  }

}

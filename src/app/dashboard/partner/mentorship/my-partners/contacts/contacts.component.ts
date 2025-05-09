import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { ContactsInterface, ContactsService } from './contacts.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ExportContactAndEmailService } from '../../../../../_common/services/exportContactAndEmail.service';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'async-my-partners-contatcs',
    templateUrl: 'contacts.component.html',
    styleUrls: ['contacts.component.scss'],
    providers: [ContactsService],
    imports: [CommonModule, MatIconModule, MatChipsModule, MatTooltipModule, RouterModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule,
        MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule, MatPaginatorModule]
})
export class MyPartnersContactsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() partner!: PartnerInterface;
  @Input() myPartner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() partnerContacts!: ContactsInterface;

  subscriptions: Array<Subscription> = [];

  dataSource = new MatTableDataSource<any>([]);  
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['select', 'name', 'phone', 'email', 'channel', 'status', 'date'];

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
    if (this.partnerContacts.data) {
      this.dataSource.data = this.partnerContacts.data.sort((a, b) => {
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

  back(): void {
    //this.router.navigateByUrl('dashboard/my-partners');
    this.router.navigate(['/dashboard/mentorship/partners/my-partners', this.myPartner._id]);
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
    this.router.navigate(['/dashboard/mentorship/partners/my-partners/contact-detail', id]);
  }

  showDescription() {
    this.dialog.open(HelpDialogComponent, {
      data: {
        help: `View and manage the imported or created contact list of your partners prospect`,
      },
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getTotalContacts(): number {
    return this.dataSource.data.length;
  }

  getTotalOnlineContacts(): number {
    //console.log(this.dataSource.data)
    return this.dataSource.data.filter(contact => contact.prospectSource === 'Unique Link').length;
  }

}

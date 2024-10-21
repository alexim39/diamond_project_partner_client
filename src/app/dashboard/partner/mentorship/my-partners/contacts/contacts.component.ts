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
import { TruncatePipe } from '../../../../../_common/pipes/truncate.pipe';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ExportContactAndEmailService } from '../../../../../_common/services/exportContactAndEmail.service';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

@Component({
  selector: 'async-my-partners-contatcs',
  templateUrl: 'contacts.component.html',
  styleUrls: ['contacts.component.scss'],
  standalone: true,
  providers: [ContactsService],
  imports: [CommonModule, MatIconModule, TruncatePipe, RouterModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule, 
    MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule, MatPaginatorModule],
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
  displayedColumns: string[] = ['select', 'name', 'phone', 'email', 'channel', 'status', 'remark', 'date', 'action'];

  selection = new Set<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private contactsService: ContactsService,
    private router: Router,
    private exportContactAndEmailService: ExportContactAndEmailService
  ) { }

  ngOnInit(): void {

    //console.log(this.partnerContacts.data)

    if (this.partnerContacts.data) {
      this.dataSource.data = this.partnerContacts.data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (this.dataSource.data.length === 0) {
        this.isEmptyRecord = true;
      }
    }

    // Custom filter predicate to filter by name
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.prospectName.toLowerCase().includes(filter.toLowerCase()) || data.prospectSurname.toLowerCase().includes(filter.toLowerCase());
    };

  }

  back(): void {
    //this.router.navigateByUrl('dashboard/my-partners');
    this.router.navigate(['/dashboard/support-partner', this.myPartner._id]);
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
      this.router.navigate(['/dashboard/send-sms']); // redirect to bulk sms page
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
      this.router.navigate(['/dashboard/send-email']); // redirect to bulk email page
    }
  }  


  preview(id: string) {
    this.router.navigate(['/dashboard/my-partner-contact-detail', id]);
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
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}

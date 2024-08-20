import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { MatIconModule } from '@angular/material/icon';
import { HelpDialogComponent } from '../../../../_common/help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import Swal from 'sweetalert2';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { ContactsInterface, ContactsService } from '../contacts.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConctactFilterPipe } from '../contacts-filter.pipe';
import { Router, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TruncatePipe } from '../../../../_common/pipes/truncate.pipe';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ExportContactAndEmailService } from '../../../../_common/services/exportContactAndEmail.service';

@Component({
  selector: 'async-manage-contatcs',
  templateUrl: 'manage-contacts.component.html',
  styleUrls: ['manage-contacts.component.scss'],
  standalone: true,
  providers: [ContactsService],
  imports: [CommonModule, MatIconModule, TruncatePipe, RouterModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule, 
    ConctactFilterPipe, MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule],
})
export class ManageContactsComponent implements OnInit, OnDestroy {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() prospectContact!: ContactsInterface;

  isSpinning = false;
  subscriptions: Array<Subscription> = [];

  dataSource: Array<any> = [];
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = ['select', 'name', 'phone', 'email', 'channel', 'status', 'remark', 'date', 'action'];

  selection = new Set<any>();


  constructor(
    private contactsService: ContactsService,
    private router: Router,
    private exportContactAndEmailService: ExportContactAndEmailService
  ) { }

  ngOnInit(): void {
    if (this.prospectContact.data) {
      this.dataSource = this.prospectContact.data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (this.dataSource.length === 0) {
        this.isEmptyRecord = true;
      }
    }
  }

  toggleSelection(element: any) {
    if (this.selection.has(element)) {
      this.selection.delete(element);
    } else {
      this.selection.add(element);
    }
  }

  isAllSelected() {
    return this.selection.size === this.dataSource.length;
  }

  isSomeSelected() {
    return this.selection.size > 0 && !this.isAllSelected();
  }

  selectAll(checked: boolean) {
    if (checked) {
      this.selection = new Set(this.dataSource);
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
      this.router.navigate(['/dashboard/send-sms']); // redirect to bulk email page
    }
  }  


  preview(id: string) {
    this.router.navigate(['/dashboard/prospect-detail', id]);
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
}

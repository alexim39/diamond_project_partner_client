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
import { ContactsInterface, ContactsService } from '../contacts.service';
import { MatInputModule } from '@angular/material/input';  
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConctactFilterPipe } from '../contacts-filter.pipe';
import { RouterModule } from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * @title Contacts
 */
@Component({
  selector: 'async-manage-contatcs',
  templateUrl: 'manage-contacts.component.html',
  styleUrls: ['manage-contacts.component.scss'],
  standalone: true,
  providers: [ContactsService],
  imports: [CommonModule, MatIconModule, RouterModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule, ConctactFilterPipe, MatButtonModule, FormsModule,MatInputModule,MatSelectModule],
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
  
    displayedColumns: string[] = ['name', 'phone', 'email', 'channel', 'status', 'remark', 'date', 'action'];

    constructor(
      private contactsService: ContactsService,
    ) {}


    ngOnInit(): void {
        if (this.prospectContact.data) {  
        //console.log(this.prospectContact.data)
        this.dataSource = this.prospectContact.data.sort((a, b) => {  
          // Use the getTime() method to compare the Date values  
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();  
        });  
    
        if (this.dataSource.length === 0) {  
          this.isEmptyRecord = true;  
        }  
      }  
    }

    preview(prospectId: string) {  }

    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          View and manage your imported or created contact list of your potential prospect
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
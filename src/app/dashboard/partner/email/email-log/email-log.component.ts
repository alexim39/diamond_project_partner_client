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
//import { ContactsInterface, ContactsService } from '../contacts.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
//import { ConctactFilterPipe } from '../contacts-filter.pipe';
import { Router, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TruncatePipe } from '../../../../_common/pipes/truncate.pipe';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ExportContactAndEmailService } from '../../../../_common/services/exportContactAndEmail.service';

@Component({
  selector: 'async-email-log',
  templateUrl: 'email-log.component.html',
  styleUrls: ['email-log.component.scss'],
  standalone: true,
  providers: [],
  imports: [CommonModule, MatIconModule, TruncatePipe, RouterModule, MatButtonToggleModule, MatTableModule, MatIconModule, MatFormFieldModule, MatProgressBarModule, 
    MatButtonModule, FormsModule, MatInputModule, MatSelectModule, MatCheckboxModule, ReactiveFormsModule],
})
export class EmailLogComponent implements OnInit, OnDestroy {
  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);
  @Input() emails!: any;

  isSpinning = false;
  subscriptions: Array<Subscription> = [];

  dataSource: Array<any> = [];
  isEmptyRecord = false;
  filterText: string = '';
  displayedColumns: string[] = [ 'subject', 'message', 'recipients', 'date',];

  selection = new Set<any>();


  constructor(
    //private contactsService: ContactsService,
    private router: Router,
    private exportContactAndEmailService: ExportContactAndEmailService
  ) { }

  ngOnInit(): void {
    if (this.emails.data) {
      this.dataSource = this.emails.data.sort((a: any, b: any) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      if (this.dataSource.length === 0) {
        this.isEmptyRecord = true;
      }
    }
  }

  pages(characters: string): number {  
    const messageLength = characters.length || 0;  
    return Math.ceil(messageLength / 160);  
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
    return Array.from(this.selection).map(item => item.reference);
  }



  preview(id: string) {
    //this.router.navigate(['/dashboard/prospect-detail', id]);

    console.log(this.getSelectedPhoneNumbers())
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
}

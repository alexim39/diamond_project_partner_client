import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { EmailService } from './email.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { EnterEmailComponent } from './enter-email/enter-email.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'async-email',
    imports: [MatButtonModule, MatIconModule, RouterModule, MatTabsModule, EnterEmailComponent, CommonModule],
    providers: [EmailService],
    templateUrl: 'email.component.html',
    styleUrls: ['email.component.scss']
})
export class EmailComponent implements OnInit, OnDestroy {

  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);

  constructor(
    private emailService: EmailService,
    private router: Router,
  ) {}

  
  ngOnInit(): void {
    //console.log('=',this.partner)

  }


  showDescription () {
    this.dialog.open(HelpDialogComponent, {
      data: {help: `
        Here, you can effortlessly send bulk email to your contact list and manage your email contacts.
      `},
    });
  }

  importEmailsNumbers() {
    this.router.navigate(['/dashboard/manage-contacts']);
  }
  
    
  ngOnDestroy() {}

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
    
}

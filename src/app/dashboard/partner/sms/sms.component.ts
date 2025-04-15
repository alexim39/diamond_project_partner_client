import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerInterface } from '../../../_common/services/partner.service';
import { smsService } from './sms.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../../../_common/help-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { EnterPhoneNumbersComponent } from './enter-phone-numbers/enter-phone-numbers.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'async-sms',
    imports: [MatButtonModule, MatIconModule, MatTabsModule, RouterModule, EnterPhoneNumbersComponent, CommonModule],
    providers: [smsService],
    templateUrl: 'sms.component.html',
    styleUrls: ['sms.component.scss']
})
export class smsComponent implements OnInit, OnDestroy {

  @Input() partner!: PartnerInterface;
  readonly dialog = inject(MatDialog);

  constructor(
    private smsService: smsService,
    private router: Router,
  ) {}

  
    ngOnInit(): void {
      //console.log('=',this.partner)

    }


    showDescription () {
      this.dialog.open(HelpDialogComponent, {
        data: {help: `
          Here, you can effortlessly send bulk SMS to your contact list and manage your SMS contacts.
        `},
      });
    }
  
    importContactPhoneNumbers() {
      this.router.navigate(['/dashboard/manage-contacts']);
    }

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  
    
  ngOnDestroy() {}
    
}

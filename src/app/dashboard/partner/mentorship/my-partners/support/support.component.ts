import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SmsService } from '../../../../../_common/services/sms.service';

/** @title Prospect details */
@Component({
    selector: 'async-my-partner-support',
    templateUrl: 'support.component.html',
    styleUrls: ['support.component.scss'],
    imports: [
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule, MatButtonModule,
        MatDividerModule, MatListModule, CommonModule, RouterModule
    ]
})
export class MyPartnerSupportComponent implements OnInit, OnDestroy {

  @Input() myPartner!: PartnerInterface;
  @Input() myPartnerPartners!: PartnerInterface[];
  duration!: null | number;
  readonly dialog = inject(MatDialog);
  subscriptions: Array<Subscription> = [];
  partner!: PartnerInterface;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private partnerService: PartnerService,
    private snackBar: MatSnackBar,
  ) {}


  back(): void {
    this.router.navigateByUrl('dashboard/my-partners');
  }


  ngOnInit(): void {
    console.log(this.myPartnerPartners)
    /* if (this.myPartner) {
      this.myPartner = this.myPartner;
    } */

    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          //console.log(this.partner)
        },
        error => {
          console.log(error)
          // redirect to home page
        }
      )
    )
  }

  viewPartnersContactList(myPartnerId: string) {
    //console.log(myPartnerId)

    //this.router.navigateByUrl('dashboard/edit-contacts', );
    this.router.navigate(['/dashboard/my-partners-contacts', myPartnerId]);
  }

  // Scroll to top when clicked
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

import { Component, inject, Input, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { LeadPipelineService } from '../../../prospects/lead-pipeline/lead-pipeline.service';
import { ActivationBoardItem } from '../../../prospects/lead-pipeline/lead.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PartnerBusinessKpiComponent } from './partner-business-kpi.component';

/** @title Prospect details */
@Component({
    selector: 'async-my-partner-support',
    templateUrl: 'support.component.html',
    styleUrls: ['support.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule, MatButtonModule, MatChipsModule,
        MatDividerModule, MatListModule, CommonModule, RouterModule,
        PartnerBusinessKpiComponent
    ]
})
export class MyPartnerSupportComponent implements OnInit, OnDestroy {

  @Input() myPartner!: PartnerInterface;
  @Input() myPartnerPartners!: PartnerInterface[];
  /** Business KPI toggle — upline drill-down for this partner's business. */
  showKpi = false;
  duration!: null | number;
  readonly dialog = inject(MatDialog);
  subscriptions: Array<Subscription> = [];
  partner!: PartnerInterface;
  /** Activation snapshot for this partner — fail-soft, page works without it. */
  supportInfo: ActivationBoardItem | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private partnerService: PartnerService,
    private leads: LeadPipelineService,
    private snackBar: MatSnackBar,
  ) {}


  back(): void {
    this.router.navigateByUrl('dashboard/mentorship/partners/my-partners');
  }


  ngOnInit(): void {
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        }
  })
    );
    // Readiness snapshot for this partner — best-effort only.
    this.subscriptions.push(
      this.leads.activationBoard().subscribe({
        next: (res) => {
          const row = (res.data?.items ?? []).find(
            (i) => String(i.partnerId) === String(this.myPartner?._id));
          this.supportInfo = row ?? null;
        },
        error: () => {},
      })
    );
  }

  /**
   * Contact details (phone/email) are visible only to the partner
   * themselves, their direct upline, or an admin. Everyone else sees
   * the public profile (name, link, progress). Fail-closed: unknown
   * linkage hides the details.
   */
  canViewContact(): boolean {
    const me = this.partner?._id ? String(this.partner._id) : '';
    const mine = this.myPartner?._id ? String(this.myPartner._id) : '';
    if (!me || !mine) return false;
    if (me === mine) return true;
    if (String(this.partner?.role ?? '').toLowerCase() === 'admin') return true;
    const raw = (this.myPartner as unknown as { partnerOf?: unknown })?.partnerOf;
    const upline = raw != null && typeof raw === 'object'
      ? String((raw as { _id?: unknown })._id ?? '')
      : String(raw ?? '');
    return !!upline && upline === me;
  }

  viewPartnersContactList(myPartnerId: string) {
    //console.log(myPartnerId)

    //this.router.navigateByUrl('dashboard/edit-contacts', );
    this.router.navigate(['/dashboard/mentorship/partners/my-partners/contacts', myPartnerId]);
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

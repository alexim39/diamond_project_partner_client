import { Component, DestroyRef, inject, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
import { ContactsInterface, ContactsService } from '../../contacts.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SMSGatewaysService } from '../../../../../_common/services/sms.service';
import { ProspectListInterface } from '../../../prospects/prospects.service';
import { ProspectService } from '../../../prospects/prospects.service';
import { CollectCodeComponent } from '../details/collect-code.component';
import { ProspectResponseComponent } from '../../../mentorship/my-partners/contacts/details/prospect-response.component';
import { SMSService } from '../../../sms/sms.service';

/** @title Prospect details */
@Component({
    selector: 'async-manage-contacts-analytics',
    templateUrl: 'manage-contacts-analytics.component.html',
    styleUrls: ['manage-contacts-analytics.component.scss'],
    imports: [
        MatCheckboxModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule, MatButtonModule,
        MatDividerModule, MatListModule, CommonModule, RouterModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [ContactsService, SMSService, SMSGatewaysService, ProspectService]
})
export class ManageContactsAnalyticsComponent implements OnInit {

  @Input() prospect!: ContactsInterface;
  prospectData!: any;
  duration!: null | number;
  loadingContact = false;
  loadError: string | null = null;
  sessions: any[] = [];
  loadingSessions = false;

  selectedStatus: string;
  remark: string;
  sms: string;
  emailBody: string;
  emailSubject: string;
  readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  partner!: PartnerInterface;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private smsService: SMSService,
    private partnerService: PartnerService,
    private snackBar: MatSnackBar,
    private smsGatewayService: SMSGatewaysService,
    private prospectsService: ProspectService
  ) {
    // You can initialize selectedStatus if needed  
    this.selectedStatus = ''; // Default value or nothing 
    this.remark = ''; // Default value or nothing 
    this.sms = ``; // Default value or nothing 
    this.emailBody = ''; // Default value or nothing 
    this.emailSubject = ''; // Default value or nothing 
  }


  back(): void {
    this.router.navigateByUrl('/dashboard/prospects/pipeline');
  }

  /** Fetch the contact for direct navigation (?id=); input path skips this. */
  loadContact(id: string): void {
    this.loadingContact = true;
    this.loadError = null;
    this.contactsService.getProspectById(id).subscribe({
      next: (res: any) => {
        this.prospectData = res?.data ?? res ?? null;
        if (!this.prospectData?._id) {
          this.prospectData = null;
          this.loadError = 'Contact not found.';
        } else {
          this.loadSessions();
        }
        this.loadingContact = false;
      },
      error: () => {
        this.prospectData = null;
        this.loadError = 'Could not load this contact.';
        this.loadingContact = false;
      },
    });
  }

  /** Sessions booked for this contact's number (matched from own bookings). */
  loadSessions(): void {
    const phone = this.normalizePhone(this.prospectData?.prospectPhone);
    if (!phone || !this.partner?._id) {
      this.sessions = [];
      return;
    }
    this.loadingSessions = true;
    this.prospectsService.getSessionBookingsFor(this.partner._id).subscribe({
      next: (res: any) => {
        const rows: any[] = res?.data ?? (Array.isArray(res) ? res : []);
        this.sessions = rows.filter((b) => this.normalizePhone(b?.phone) === phone);
        this.loadingSessions = false;
      },
      error: () => {
        this.sessions = [];
        this.loadingSessions = false;
      },
    });
  }

  /** Last-10-digits comparison — tolerates 080… vs +234… formats. */
  normalizePhone(phone: any): string {
    const digits = String(phone ?? '').replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }


  ngOnInit(): void {
    //console.log(this.prospect.data)
    if (this.prospect) {
      this.prospectData = this.prospect;
      this.loadSessions();
    } else {
      // Routed directly (no @Input) — deep link via ?id=.
      this.route.queryParamMap
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((params) => {
          const id = params.get('id');
          if (id && !this.prospectData) this.loadContact(id);
        });
    }

    // get current signed in user (shared subject — tracked)
    this.partnerService.getSharedPartnerData$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(
        partnerObject => {
          this.partner = partnerObject as PartnerInterface
          //console.log(this.partner)
          // Partner can arrive after the contact — (re)load sessions then.
          if (this.prospectData?._id) this.loadSessions();
        },
        error => {
          console.log(error)
          // redirect to home page
        }
      )

  }

  updateProspectStatus() {
    const obj = { status: this.selectedStatus, prospectId: this.prospectData._id }
    if (!obj.status) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You should select a status before updating!',
        showConfirmButton: false,
        timer: 4000
      })
      return;
    }
    // NOTE: status update is disabled upstream (kept for reference).
  }

  updateProspectRemark() {

    const obj = { remark: this.remark, prospectId: this.prospectData._id }
    if (!obj.remark) {
      Swal.fire({
        position: "bottom",
        icon: 'info',
        text: 'You should enter new remark before updating!',
        showConfirmButton: false,
        timer: 4000
      })
      return;
    }

    // NOTE: remark update is disabled upstream (kept for reference).

  }

  deleteProspect() {
    const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    Swal.fire({
      title: `Are you sure of deleting ${capitalizeFirstLetter(this.prospectData.prospectSurname)} ${capitalizeFirstLetter(this.prospectData.prospectName)}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.contactsService.deleteProspect(this.prospectData._id).subscribe((prospect: ContactsInterface) => {
            // this.prospectContact = prospectContact;
            //console.log('prospectContact ',prospectStatus)
            Swal.fire({
              position: "bottom",
              icon: 'success',
              text: `Your have successfully deleted  ${capitalizeFirstLetter(this.prospectData.prospectSurname)} ${capitalizeFirstLetter(this.prospectData.prospectName)}`,
              showConfirmButton: true,
              confirmButtonColor: "#ffab40",
              timer: 15000,
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('dashboard/manage-contacts');
              }
            });

          }, (error: any) => {
            //console.log(error)
            Swal.fire({
              position: "bottom",
              icon: 'info',
              text: 'Server error occured, please and try again',
              showConfirmButton: false,
              timer: 4000
            })
          })

      }
    });
  }

  promoteProspectToPartner() {
    const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    //const obj = {prospectId: this.prospectData._id, code: '' } 

    Swal.fire({
      title: `Is ${capitalizeFirstLetter(this.prospectData.prospectSurname)} ${capitalizeFirstLetter(this.prospectData.prospectName)} now your partner?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, promote!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialog.open(CollectCodeComponent, {
          data: this.prospectData
        }).afterClosed().subscribe((res: any) => {
          // Reflect the conversion locally so the page updates
          // without a manual reload; server remains source of truth.
          if (res?.converted && this.prospectData?._id) {
            this.loadContact(this.prospectData._id);
          }
        });
      }
    });
  }

  copyLink() {
    const link = `www.c21fg.online/${this.partner.username}`;
    navigator.clipboard.writeText(link).then(() => {
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 2000,
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  sendSMS() {

    this.contactsService.signleSMSCharge(this.partner._id).subscribe((smsCharge: any) => {
        //console.log('sms ',smsCharge)
        const transactionId = smsCharge?.data._id;

        // call sms gateway
        this.callSMSGate(transactionId)

      }, (error: any) => {
        //console.log(error)
        if (error.code == 401) {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Insufficient balance for transaction, please fund your account.',
            showConfirmButton: false,
            timer: 4000
          })
        } else {
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Server error occured, please and try again',
            showConfirmButton: false,
            timer: 4000
          })
        }

      })
  }

  private callSMSGate(transactionId: string) {

    this.smsGatewayService.send(this.prospectData.prospectPhone, this.sms).subscribe(
        response => {
          //console.log('SMS sent successfully:', response);  

          if (response.data.status == 'success') {
            const smsObject = {
              partner: this.partner._id,
              prospect: this.prospectData.prospectPhone,
              smsBody: this.sms,
              transactionId: transactionId,
              status: "success"
            }
            // record sms to database
            this.smsService.saveSMSRecord(smsObject).subscribe((smsSave: ContactsInterface) => {
                //console.log('smsSave ',smsSave)

                Swal.fire({
                  position: "bottom",
                  icon: 'success',
                  text: 'SMS sent successfully',
                  showConfirmButton: false,
                  timer: 4000
                });
              })
          } else {
            const smsObject = {
              partner: this.partner._id,
              prospect: this.prospectData.prospectPhone,
              smsBody: this.sms,
              transactionId: transactionId,
              status: "failed"
            }
            // record sms to database
            this.smsService.saveSMSRecord(smsObject).subscribe((smsSave: ContactsInterface) => {
                //console.log('smsSave ',smsSave)

                Swal.fire({
                  position: "bottom",
                  icon: 'info',
                  text: 'SMS was not sent successfully',
                  showConfirmButton: false,
                  timer: 4000
                });
              })
          }


        },
        (error) => {
          //console.error('Error sending SMS:', error);  
          Swal.fire({
            position: "bottom",
            icon: 'info',
          text: 'SMS not sent, there was an error sending SMS',
          showConfirmButton: false,
          timer: 4000
          })
        }
      );
  }

  sendEmail() {
    const emailObject = {
      partner: this.partner,
      prospect: this.prospectData,
      emailBody: this.emailBody,
      emailSubject: this.emailSubject
    }
    this.contactsService.sendProspectEmail(emailObject).subscribe(
        response => {
          //console.log('SMS sent successfully:', response);
          Swal.fire({
            position: "bottom",
            icon: 'success',
            text: 'Email sent successfully',
            showConfirmButton: false,
            timer: 4000
          })
        },
        error => {
          //console.error('Error sending SMS:', error);
          Swal.fire({
            position: "bottom",
            icon: 'info',
            text: 'Email not sent, there was an error sending SMS',
            showConfirmButton: false,
            timer: 4000
          })
        }
      )
  }

  editProspectDetail() {
    this.router.navigate(['/dashboard/prospects/edit', this.prospectData._id]);
  }

  bookProspectSession() {
    this.router.navigate(['/dashboard/prospects/booking', this.prospectData._id]);
  }

  /** Merged stage moves + logged touches, newest first. */
  timeline(): Array<{ at: any; label: string; detail: string }> {
    const items: Array<{ at: any; label: string; detail: string }> = [];
    for (const h of this.prospectData?.stageHistory ?? []) {
      items.push({
        at: h?.at ?? null,
        label: `Stage: ${h?.from ?? '—'} → ${h?.to ?? '—'}`,
        detail: h?.byName ? `by ${h.byName}` : '',
      });
    }
    for (const c of this.prospectData?.communications ?? []) {
      items.push({
        at: c?.date ?? null,
        label: `${c?.type ?? 'touch'} — ${c?.description ?? ''}`,
        detail: [c?.interestLevel, c?.outcome].filter(Boolean).join(' · '),
      });
    }
    return items.sort((a, b) => new Date(b.at ?? 0).getTime() - new Date(a.at ?? 0).getTime());
  }

  ViewResponse(prospect: ProspectListInterface) {
    this.dialog.open(ProspectResponseComponent, {
      data: prospect
    });
  }


}

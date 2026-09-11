
import {Component, DestroyRef, inject, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../../_common/services/partner.service';
import { filter, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManageCampaignComponent } from './manage-campaign.component';
import { CampaignInterface, CampaignService } from './manage-campaign.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';


/**
 * @title Manage comapaing container
 */
@Component({
selector: 'async-manage-campaign-container',
imports: [ManageCampaignComponent, MatIconModule, MatButtonModule],
providers: [CampaignService],
template: `
 @if(isEmptyRecord) {
   <div class="container">
     <p class="no-content">
       <!-- Something Went Wrong or may be you dont have logs yet! -->
       {{serverErrorMessage}} or Something went wrong
 
     </p>
     <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
   </div>
 } @else {
   @if (partner && campaigns) {
     <async-manage-campaign [partner]="partner" [campaigns]="campaigns"/>
     } }
 
 `,
changeDetection: ChangeDetectionStrategy.Eager,
styles: `
   .container {
     padding: 2em;
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;
   }
   .no-content {
     color: rgb(196, 129, 4);
     font-weight: bold;
   }
    
`
})
export class ManageCampaignContainerComponent implements OnInit {

  partner!: PartnerInterface;
  campaigns!: CampaignInterface[];
  isEmptyRecord = false;
  serverErrorMessage = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private partnerService: PartnerService,
    private campaignService: CampaignService,
    private router: Router,
  ) { }

  ngOnInit() {

    // get current signed in user, then their campaigns — one stream,
    // no nested subscribes (re-emissions cancel the in-flight fetch).
    this.partnerService.getSharedPartnerData$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((partner): partner is PartnerInterface => !!partner),
      tap(partner => { this.partner = partner; }),
      switchMap(partner => this.campaignService.getCampaignCreatedBy(partner._id))
    ).subscribe({
        next: (response) => {
          //console.log(response)
          if (response.success) {
            this.campaigns = response.data;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.isEmptyRecord = true;
          this.serverErrorMessage = error.error.message;
        }
      })
  }

   back(): void {
    //window.history
   this.router.navigateByUrl('dashboard/tools/campaigns/new');
  }
}
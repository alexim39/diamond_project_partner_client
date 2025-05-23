import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MyPartnerSupportComponent } from './support.component';
import { Subscription } from 'rxjs';
import { PartnerInterface } from '../../../../../_common/services/partner.service';
import { MyPartnersService } from '../my-partners.service';

@Component({
    selector: 'async-my-partner-support-container',
    template: `
  <ng-container *ngIf="!isEmptyRecord">
    <async-my-partner-support 
      *ngIf="myPartner" 
        [myPartner]="myPartner"
       [myPartnerPartners]="myPartnerPartners"
    />
  </ng-container>
    <ng-container *ngIf="isEmptyRecord">
        <div class="container">
          <p class="no-content">Something Went Wrong or may be you dont have contacts yet!</p>
          <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
        </div>
    </ng-container>
  `,
    providers: [MyPartnersService],
    imports: [MyPartnerSupportComponent, CommonModule, MatButtonModule, MatIconModule],
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
export class MyPartnerSupportContainerComponent implements OnInit, OnDestroy {

  myPartner!: PartnerInterface;
  myPartnerId!: string | null;
  isEmptyRecord = false;
  subscriptions: Subscription[] = [];

  myPartnerPartners!: any; //Array<PartnerInterface>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private myPartnersService: MyPartnersService
  ) { }

  back(): void {
    this.router.navigateByUrl('dashboard/mentorship/partners/my-partners');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.myPartnerId = params.get('id');
      if (this.myPartnerId !== null) {
        // Fetch partner details using the ID
        this.subscriptions.push(
          this.myPartnersService.getPartnerById(this.myPartnerId).subscribe({
            next: (partner) => {
            //console.log(partner.data)
            this.myPartner = partner.data;

            // Get this partner's downlines/partner
            this.myPartnersService.getPartnersOf(partner.data._id).subscribe({
              next: (partnerPartners) => {
                this.myPartnerPartners = partnerPartners.data;
              }
            })
          }, 
          error: () => {
            this.isEmptyRecord = true;
          }
        })
        )
      }
    });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /*  browserBackHistory () {
     window.history.back();  
   } */
}

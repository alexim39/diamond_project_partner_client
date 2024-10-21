import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MyPartnerContactsDetailComponent } from './contacts-detail.component';
import { ContactsInterface, ContactsService, } from '../contacts.service';
import { Subscription } from 'rxjs';
import { MyPartnersService } from '../../my-partners.service';
import { PartnerInterface } from '../../../../../../_common/services/partner.service';

@Component({
  selector: 'async-manage-contacts-detail-container',
  template: `
  <ng-container *ngIf="!isEmptyRecord">
    <async-my-partner-contacts-detail *ngIf="prospect" [prospect]="prospect" [myPartner]="myPartner"></async-my-partner-contacts-detail>
  </ng-container>
    <ng-container *ngIf="isEmptyRecord">
        <div class="container">
          <p class="no-content">Something Went Wrong or may be you dont have contacts yet!</p>
          <button mat-flat-button (click)="back()"><mat-icon>arrow_back</mat-icon>Go back</button>
        </div>
    </ng-container>
  `,
  standalone: true,
  providers: [ContactsService, MyPartnersService],
  imports: [MyPartnerContactsDetailComponent, CommonModule, MatButtonModule, MatIconModule],
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
export class MyPartnerContactsDetailContainerComponent implements OnInit, OnDestroy {

  prospect!: ContactsInterface;
  myPartnerId!: string | null;
  isEmptyRecord = false;
  subscriptions: Subscription[] = [];
  myPartner!: PartnerInterface;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private myPartnersService: MyPartnersService,

  ) { }

  back(): void {
    this.router.navigateByUrl('dashboard/manage-contacts');
    //this.router.navigate(['/dashboard/my-partners-contacts', this.myPartner._id]);
  }

  ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        this.myPartnerId = params.get('id');
        if (this.myPartnerId) {
          // Fetch prospect details using the ID
          this.subscriptions.push(
            this.contactsService.getProspectById(this.myPartnerId).subscribe(prospect => {
              this.prospect = prospect;
             // console.log(this.prospect)
            }, error => {
              this.isEmptyRecord = true;
            })
          )

           // Fetch partner details using the ID
          /* this.subscriptions.push(
            this.myPartnersService.getPartnerById(this.myPartnerId).subscribe(partner => {
              this.myPartner = partner.data;
              console.log('the partner', this.myPartner)
            })
          ) */
          
        }
      });
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

 /*  browserBackHistory () {
    window.history.back();  
  } */
}

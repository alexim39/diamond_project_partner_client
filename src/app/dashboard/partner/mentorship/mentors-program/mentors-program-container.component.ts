import { CommonModule } from '@angular/common';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { MentorsProgramComponent } from './mentors-program.component';


/**
 * @title cell meeting container
 */
@Component({
    selector: 'async-mentors-program-container',
    imports: [CommonModule, MentorsProgramComponent],
    providers: [],
    template: `
  <async-mentors-program *ngIf="partner" [partner]="partner"/>
  `
})
export class MentorsProgramContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  subscriptions: Subscription[] = [];

  constructor(
    private partnerService: PartnerService,
  ) { }

  ngOnInit() {
      
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
       
        next: (partner: PartnerInterface) => {
          this.partner = partner;
        }
    })
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
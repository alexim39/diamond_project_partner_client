
import {Component, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { PartnerInterface, PartnerService } from '../../../../_common/services/partner.service';
import { Subscription } from 'rxjs';
import { PushNotificationListComponent } from './push-notification-list.component';
import { PushNotificationInterface, PushNotificationService } from '../../index/push-notifications/push-notifications.service';


@Component({
    selector: 'async-push-notification-list-container',
    imports: [PushNotificationListComponent],
    providers: [PushNotificationService],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
  @if (partner && notifications) {
    <async-push-notification-list [partner]="partner" [notifications]="notifications"/>
  }
  `
})
export class PushNotificationListContainerComponent implements OnInit, OnDestroy {

  partner!: PartnerInterface;
  campaigns!: any;
  subscriptions: Subscription[] = [];
  notifications: Array<PushNotificationInterface> = [];

  constructor(
    private partnerService: PartnerService,
    private notifier: PushNotificationService,
  ) { }

  ngOnInit() {
    // get current signed in user
    this.subscriptions.push(
      this.partnerService.getSharedPartnerData$.subscribe({
        next: (partner: PartnerInterface) => {
          this.partner = partner;
          if (this.partner) {
            this.subscriptions.push(
              this.notifier.getNotifications(this.partner._id).subscribe({
                next: (response) => {
                  //console.log(response)
                  this.notifications = response.data;
                }
              })
            )
          }
        },
      })    
    )
  }

  ngOnDestroy() {
    // unsubscribe list
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
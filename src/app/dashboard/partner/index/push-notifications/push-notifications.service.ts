import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../../_common/services/api.service';

export interface PushNotificationInterface {
  title: string;
  description: string;
  icon: string;
  tag: string;
  urgency?: boolean;
  status: any;
  communication: any;
  prospectId: string;
}
  

@Injectable()
export class PushNotificationService {
  constructor(private apiService: ApiService) {}

  // get sms byId
  getNotifications(partnerId: string): Observable<any> {
    return this.apiService.get<any>(`settings/notification/getById/${partnerId}`, undefined, undefined, true);
  }

  // get sms byId
  MarkNotificationAsClosed(prospectId: string, notificationId: string): Observable<any> {
    return this.apiService.get<any>(`settings/notification/delete/${prospectId}/${notificationId}`, undefined, undefined, true);
  }


   
}
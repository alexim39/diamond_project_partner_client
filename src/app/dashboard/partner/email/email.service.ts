import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ApiService } from '../../../_common/services/api.service';

export interface EmailInterface {
  message: string;
  data?: any
}
  

@Injectable()
export class EmailService {
  constructor(private apiService: ApiService) {}

  // get sms byId
  getEmailsCreatedBy(partnerId: string): Observable<any> {
    return this.apiService.get<EmailInterface>(`emails/getById/${partnerId}`, undefined, undefined, true);
  }

  // send bulk email
  sendEmail(formObject: FormGroup): Observable<EmailInterface> {
    return this.apiService.post<EmailInterface>(`emails/send-email`, formObject, undefined, true);
  }

  // detele single email
  deleteSingleEmail(emailId: string): Observable<any> {
      return this.apiService.delete<any>(`emails/delete-single/${emailId}`, undefined, undefined, true);
  }
    
   
}
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../_common/services/api.service';

export interface SettingsInterface {
  id: string;
}
  

@Injectable()
export class SettingsService {
  constructor(private apiService: ApiService) {}

   updateNotificationPreference(formData: {value: string; partnerId: string}): Observable<any> {
    return this.apiService.put<string>(`settings/notification`, formData, undefined, true);
  }

 /*  // profile update
  profileUpdate(formData: ProfileInterface): Observable<any> {
    return this.apiService.put<ProfileInterface>(`partners/update-profile`, formData, undefined, true);
  }

  // profession update
 

  // username Update 
  usernameUpdate(formData: ProfileInterface): Observable<any> {;
    return this.apiService.put<ProfileInterface>(`partners/update-username`, formData, undefined, true);
  }

   // change Password 
   changePassword(formData: ProfileInterface): Observable<any> {
    return this.apiService.put<ProfileInterface>(`partners/change-password`, formData, undefined, true);
  } */

   
}
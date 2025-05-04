import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';
import { PartnerInterface } from '../../../../_common/services/partner.service';
import { ApiService } from '../../../../_common/services/api.service';
import { httpResponse } from '../../../../_common/server-response';

export interface TeamInterface {  
  teamName: string;          // The name of the team  
  description?: string;     // Description or purpose of the team (optional)  
  teamPurpose: string;      // Purpose of the team  
  partnerId: string;
  createdAt?: any;
  _id?: any;
  members?: PartnerInterface[];
} 
  

@Injectable()
export class TeamService {
  constructor(private apiService: ApiService) {}

  // create team
  createTeam(formObject: TeamInterface): Observable<httpResponse> {
    return this.apiService.post<httpResponse>(`team/create`, formObject, undefined, true);
  }

  // update team
  updateTeam(formObject: FormGroup): Observable<httpResponse> {
    //console.log('record', teamObject);
      return this.apiService.put<httpResponse>(`team/`, formObject, undefined, true);
  }

   // get teams createdby
   getAllTeamsBy(partnerId: string): Observable<Array<TeamInterface>> {
      return this.apiService.get<Array<TeamInterface>>(`team/all-createdBy/${partnerId}`, undefined, undefined, true);
  }

   // get teams either createdby partner or is a member
   getAllTeamsCreatedOrMember(partnerId: string): Observable<Array<TeamInterface>> {
      return this.apiService.get<Array<TeamInterface>>(`team/all-createdByOrMember/${partnerId}`, undefined, undefined, true);
  }

   // get a createdby
   getTeamById(id: string): Observable<any> {
      return this.apiService.get<TeamInterface>(`team/${id}`, undefined, undefined, true);

  }

   // editTeam
   editTeam(id: string): Observable<Array<TeamInterface>> {
      return this.apiService.get<Array<TeamInterface>>(`team/edit/${id}`, undefined, undefined, true);
  }

   // deleteTeam
   deleteTeam(id: string): Observable<any> {
      return this.apiService.delete<Array<TeamInterface>>(`team/${id}`, undefined, undefined, true);
  }

  // activate new partner 
  activateNewPartner(formObject: any): Observable<any> {
      return this.apiService.post<httpResponse>(`reservationCode/new-partner`, formObject, undefined, true);
  }

   // add team memeber
   addTeamMember(teamMemberObject: PartnerInterface[], teamId: string): Observable<TeamInterface> {
      return this.apiService.post<TeamInterface>(`team/add-member`, {teamMemberObject, teamId}, undefined, true);
  }

  // delete Team member
  deleteTeamMember(memberId: string, teamId: string): Observable<any> {
      return this.apiService.delete<Array<TeamInterface>>(`team/remove-member/${teamId}/${memberId}`, undefined, undefined, true);
  }
    
}
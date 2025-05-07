import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface PartnerInterface {
  _id: string;
  //courses?: Array<CourseInterface> | Array<string> | any;
  status: boolean;
  name: string;
  surname: string;
  email: string;
  reservationCode: string;
  phone: string;
  password: string;
  username: string;
  bio?: string;
  address: Address;
  visits?: number;
  dobDatePicker?: Date;
  balance?: number;
  role?: string;
  profileImage?: string;
  jobTitle?: string;
  educationBackground?: string;
  hobby?: string;
  skill?: string;
  whatsappGroupLink?: string;
  whatsappChatLink?: string;
  testimonial?: string;
  linkedinPage?: string;
  youtubePage?: string;
  instagramPage?: string;
  tiktokPage?: string;
  facebookPage?: string;
  twitterPage?: string;
  createdAt?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

@Injectable()
export class PartnerService {
  constructor(private apiService: ApiService) {}
  
   /**
   * Get partner data to the backend API.
   * @returns An Observable that emits the API response or an error.
   */
   getPartner(): Observable<any> {
    return this.apiService.get<PartnerInterface>(`auth`, undefined, undefined, true);
  }

  private partnerSubject = new BehaviorSubject<any>(null); // Initial value can be anything

  getSharedPartnerData$ = this.partnerSubject.asObservable();

  updatePartnerService(data: PartnerInterface) {
    //console.log('login ',data)
    this.partnerSubject.next(data);
  }


}
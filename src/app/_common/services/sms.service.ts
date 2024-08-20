import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  

@Injectable({  
  providedIn: 'root'  
})  
export class SmsService {  

  private apiUrl = 'https://www.bulksmsnigeria.com/api/v2/sms';  
  
  constructor(private http: HttpClient) { }  

  sendSms( to: string | Array<string>, body: string, from = "DiamondProj"): Observable<any> {  
    //console.log('to ',to)
    //console.log('from ',from)
    //console.log('body ',body)
    const smsData = {  
      body: body,  
      from: from,  
      to: to,  
      api_token: "A96OEGodidxFWRn6UgOoqtk5CzFv47eJWX8Ix5NS0YxDxE1enFqSUz5kV2MW",  
      gateway: "direct-refund",  
      customer_reference: "HXYSJWKKSLOX",  
      callback_url: "https://www.airtimenigeria.com/api/reports/sms"  
    };  
    
    const headers = new HttpHeaders({  
      'Accept': 'application/json',  
      'Content-Type': 'application/json'  
    });  

    return this.http.post(this.apiUrl, smsData, { headers });  
  }  
}
import { Injectable } from '@angular/core';  
import { HttpClient, HttpHeaders } from '@angular/common/http';  
import { Observable } from 'rxjs';  

@Injectable()  
export class SMSGatewaysService {  

  private apiUrl = 'https://www.bulksmsnigeria.com/api/v2/sms';  
  
  constructor(private http: HttpClient) { }  

  send( to: string | Array<string>, body: string, from = "C21FG"): Observable<any> {  
    // console.log('to ',to)
    // console.log('from ',from)
    // console.log('body ',body)
    const smsData = {  
      body,
      from,
      to, 
      api_token: "wAW4HgFfHcbtgRRzWuYUBKQhiHdMuBBSSn6O8Nwv35JPNSrACwFlY6b0rLbS",  
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
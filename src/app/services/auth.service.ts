import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly serviceBase = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  /**
   * return data in this format 
   * { "token": "JWT TOKEN", "identity": "twilio identity"}
   * @param username 
   */
  authenticate(username: string) {
    console.log(`authenticating... start`);
    //const res = this.http.get<any>(`${this.serviceBase}/users/token/${username}`);
    const res = { 
      token: 'JWT TOKEN',
      identity: 'twilio identity'
    };
    console.log(`authenticating... done`);
    return res;
  }

  refreshToken() {
    /* this.authenticate(localStorage.getItem('twackUsername')).subscribe( (auth: any) => {
      localStorage.setItem('twackToken', auth.token);
    }); */
    const auth = this.authenticate(localStorage.getItem('twackUsername'));
    localStorage.setItem('twackToken', auth.token);
  }
}

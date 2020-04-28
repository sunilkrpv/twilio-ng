import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public username: string;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (localStorage.getItem('twackUsername')) {
      this.username = localStorage.getItem('twackUsername');
    }
    if (localStorage.getItem('twackToken') ) {
      this.router.navigate(['/chat']);
    }
  }

  submitLogin() {

    // Will work only when the name is provided. No return authtentication so far implemented.
    localStorage.setItem('twackUsername', this.username);
    /* this.authService.authenticate(this.username)
      .subscribe( (res: any) => {
        window.alert(JSON.stringify(res));
        localStorage.setItem('twackToken', res.token);
        this.router.navigate(['/chat']);
      }); */
    
    /* this.authService.authenticate('hell')
      .subscribe((res: any) => {
        window.alert(JSON.stringify(res));
        this.router.navigate(['/chat']);
      }); */
    const value = this.authService.authenticate('hell');
    localStorage.setItem('twackToken', value.token);
    this.router.navigate(['/chat']);
  }

}

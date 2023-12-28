import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormControl } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  email = new FormControl('');
  password = new FormControl('');
  firstname = new FormControl('');
  lastname = new FormControl('');
  registerEmail = new FormControl('');
  registerPassword = new FormControl('');
  hasToken: boolean = false;
  user: any = {};
  tokens: any = {};
  constructor(
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.hasToken = this.cookieService.check('jwt');
    if (this.hasToken) {
      const token = this.cookieService.get('jwt');

      // Call the API to check token validity
      this.http
        .get(
          `http://localhost:8222/api/auth/user/check-token-validity/${token}`
        )
        .subscribe((response: any) => {
          if (response.message.trim().toLowerCase() === 'not valid') {
            // If the token is not valid, remove 'jwt' and refresh token from cookies
            this.cookieService.delete('jwt');
            this.cookieService.delete('refreshToken');
            location.reload();
          } else {
            const decodedToken = jwtDecode(token);
            this.tokens = decodedToken;
            if (this.tokens.sub) {
              this.http
                .get(
                  `http://localhost:8222/api/auth/user/findByEmail/${this.tokens.sub}`
                )
                .subscribe((response: any) => {
                  this.user = response;
                });
            }
          }
        });

      this.cdr.detectChanges();
    }
  }
  onSubmit() {
    this.http
      .post('http://localhost:8222/api/auth/user/login', {
        email: this.email.value,
        password: this.password.value,
      })
      .subscribe((response: any) => {
        this.cookieService.set('jwt', response.access_token);
        this.cookieService.set('refresh', response.refresh_token);
        location.reload();
      });
  }
  onRegister() {
    this.http
      .post('http://localhost:8222/api/auth/user/register', {
        firstname: this.firstname.value,
        lastname: this.lastname.value,
        email: this.registerEmail.value,
        password: this.registerPassword.value,
      })
      .subscribe((response: any) => {
        this.cookieService.set('jwt', response.access_token);
        this.cookieService.set('refresh', response.refresh_token);
        location.reload();
      });
  }
  logout() {
    this.http
      .get('http://localhost:8222/api/auth/user/logout')
      .subscribe(() => {
        this.cookieService.delete('jwt');
        this.cookieService.delete('refreshToken');
        location.reload();
      });
  }
}

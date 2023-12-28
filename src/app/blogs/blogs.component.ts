import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css',
})
export class BlogsComponent {
  cities: any[] = [];
  categories: any[] = [];
  blogForm: FormGroup;
  hasToken: boolean = false;
  user: any = {};
  tokens: any = {};
  constructor(
    private http: HttpClient,
    @Inject(FormBuilder) private fb: FormBuilder,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
  ) {
    this.blogForm = this.fb.group({
      title: '',
      content: '',
      city: '',
      category: '',
      publicationDate: new Date().toISOString().slice(0, 19),
      author: this.user.id, // replace 'user.id' with the actual user id
    });
  }
  ngOnInit() {
    this.http
      .get<any[]>('http://localhost:8222/api/blogs/city')
      .subscribe((data) => {
        this.cities = data;
      });
    this.http
      .get<any[]>('http://localhost:8222/api/blogs/category')
      .subscribe((data) => {
        this.categories = data;
      });

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
            console.log(
              '🚀 ~ file: navbar.component.ts:33 ~ NavbarComponent ~ ngDoCheck ~ tokens:',
              this.tokens
            );
            this.getUserData();
          }
        });

      this.cdr.detectChanges();
    }
    else {
      location.href = '/';
    }
  }
  getUserData(): void {
    if (this.tokens.sub) {
      this.http.get(`http://localhost:8222/api/auth/user/findByEmail/${this.tokens.sub}`).subscribe((response: any) => {
        this.user = response;
        console.log('🚀 ~ file: navbar.component.ts:32 ~ NavbarComponent ~ ngOnInit ~ user:', this.user);
        this.initializeForm();
      });
    }
  }

  initializeForm(): void {
    this.blogForm = this.fb.group({
      title: '',
      content: '',
      city: '',
      category: '',
      publicationDate: new Date().toISOString().slice(0, 19),
      author: this.user.id
    });
  }
  onSubmit() {
    const formData = this.blogForm.value;
    formData.city = { id: formData.city };
    formData.category = { id: formData.category };
    this.http
      .post('http://localhost:8222/api/blogs/blog', formData)
      .subscribe((response) => {
        console.log(response);
      });
  }
}

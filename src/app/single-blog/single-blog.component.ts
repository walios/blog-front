import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { MarkdownService } from 'ngx-markdown';
import { Inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-single-blog',
  templateUrl: './single-blog.component.html',
  styleUrls: ['./single-blog.component.css'],
})
export class SingleBlogComponent {
  blogs: any[] = [];
  user: any = {};
  hasToken: boolean = false;
  tokens: any = {};
  comments: any[] = [];

  constructor(
    private http: HttpClient,
    @Inject(MarkdownService) private markdownService: MarkdownService,
    private router: Router,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.hasToken = this.cookieService.check('jwt');
    if (this.hasToken) {
      const token = this.cookieService.get('jwt');

      // Call the API to check token validity
      this.http
        .get(`http://localhost:8222/api/auth/user/check-token-validity/${token}`)
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
                .get(`http://localhost:8222/api/auth/user/findByEmail/${this.tokens.sub}`)
                .subscribe((response: any) => {
                  this.user = response;
                  this.getBlogs();
                });
            }
          }
        });

      this.cdr.detectChanges();
    }
  }


  
  getBlogs(): void {
    const url = this.router.url;
    if (url === '/') {
      this.http
        .get<any[]>('http://localhost:8222/api/blogs/blog')
        .pipe(
          switchMap((blogs) => {
            this.blogs = blogs;
            const requests = blogs.map((blog) =>
              this.http.get<{ firstname: string; lastname: string }>(
                `http://localhost:8222/api/auth/user/${blog.author}`
              )
            );
            return forkJoin(requests);
          })
          ,
          switchMap((blogResponses) => {
            blogResponses.forEach((response, index) => {
              this.blogs[index].firstname = response.firstname;
              this.blogs[index].lastname = response.lastname;
              this.blogs[index].content = this.markdownService.parse(
                this.blogs[index].content
              );
            });
      
            const commentRequests = this.blogs.flatMap((blog) =>
              blog.commentList.map((comment: { user_id: any; }) =>
                this.http.get<{ firstname: string; lastname: string }>(
                  `http://localhost:8222/api/auth/user/${comment.user_id}`
                ).pipe(
                  map((response) => ({ comment, response }))
                )
              )
            );
      
            return forkJoin(commentRequests);
          })
        )
        .subscribe((commentResponses) => {
          commentResponses.forEach(({ comment, response }) => {
            comment.user = {
              firstname: response.firstname,
              lastname: response.lastname
            };
          });
        });
    } else {
      this.http
        .get<any[]>(`http://localhost:8222/api/blogs/blog/by-user/${this.user.id}`)
        .pipe(
          switchMap((blogs) => {
            this.blogs = blogs;
            const requests = blogs.map((blog) =>
              this.http.get<{ firstname: string; lastname: string }>(
                `http://localhost:8222/api/auth/user/${blog.author}`
              )
            );
            return forkJoin(requests);
          })
          ,
          switchMap((blogResponses) => {
            blogResponses.forEach((response, index) => {
              this.blogs[index].firstname = response.firstname;
              this.blogs[index].lastname = response.lastname;
              this.blogs[index].content = this.markdownService.parse(
                this.blogs[index].content
              );
            });
      
            const commentRequests = this.blogs.flatMap((blog) =>
              blog.commentList.map((comment: { user_id: any; }) =>
                this.http.get<{ firstname: string; lastname: string }>(
                  `http://localhost:8222/api/auth/user/${comment.user_id}`
                ).pipe(
                  map((response: any) => ({ comment, response }))
                )
              )
            );
      
            return forkJoin(commentRequests);
          })
        )
        .subscribe((commentResponses) => {
          commentResponses.forEach(({ comment, response }) => {
            comment.user = {
              firstname: response.firstname,
              lastname: response.lastname
            };
          });
          console.log("🚀 ~ file: single-blog.component.ts ~ SingleBlogComponent ~ commentResponses.forEach ~ blogs:", this.blogs)
        });
    }
  }

  postComment(blogId: number, commentText: string): void {
    const data = {
      "user_id": this.user.id,
      "comment_text": commentText,
      "blogId": blogId
    };

    this.http.post('http://localhost:8222/api/social/comment', data).subscribe(response => {
      console.log(response);
    }, error => {
      console.log(error);
    });
  }
  getRandomNumber(): number {
    return Math.floor(Math.random() * 100); // generates a random number between 0 and 99
  }
  getRandomDate(): string {
    const start = new Date(2021, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService, AuthUser } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Use directives directly so routerLink/routerLinkActive work in the template
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.html',
  styleUrls: ['./login.css', '../home/home.css']
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private session: AuthService
  ) {}

  loginUser() {
    if (this.loading) return;
    this.message = '';

    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    if (!email || !password) {
      this.message = 'Please fill in all fields.';
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost/SpeakMate/backend/api/login.php', { email, password })
      .subscribe({
        next: (res) => {
          this.loading = false;

          if (res?.success && res?.user) {
            const user: AuthUser = {
              id: res.user.id,
              email: res.user.email,
              full_name: res.user.full_name,
              token: res.token
            };
            this.session.login(user);

            const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
            this.router.navigateByUrl(returnUrl);
          } else {
            this.message = res?.error || 'Login failed.';
          }
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 0) this.message = 'Cannot reach server (CORS/network).';
          else if (err.status === 401) this.message = 'Invalid email or password.';
          else if (err.error?.error) this.message = err.error.error;
          else this.message = 'Error connecting to server.';
        }
      });
  }
}

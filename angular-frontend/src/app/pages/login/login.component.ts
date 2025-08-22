import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    private session: AuthService
  ) {}

  loginUser() {
    if (this.loading) return; // prevent double click
    this.message = '';

    const email = this.email.trim().toLowerCase();
    const password = this.password.trim();

    console.log('[Login] Email:', JSON.stringify(email));
    console.log('[Login] Password length:', password.length);

    if (!email || !password) {
      this.message = 'Please fill in all fields.';
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost/SpeakMate/backend/api/login.php', { email, password })
      .subscribe({
        next: (res) => {
          console.log('[Login] Response:', res);
          this.loading = false;

          if (res?.success && res?.user) {
            const user: AuthUser = {
              id: res.user.id,
              email: res.user.email,
              full_name: res.user.full_name
            };
            this.session.login(user);  // ✅ persist
            this.router.navigate(['/dashboard']); // ✅ go to dashboard
          } else {
            this.message = res?.error || 'Login failed.';
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('[Login] HTTP error:', err);
          if (err.status === 0) {
            this.message = 'Cannot reach server (CORS/network).';
          } else if (err.status === 401) {
            this.message = 'Invalid email or password.';
          } else if (err.error?.error) {
            this.message = err.error.error;
          } else {
            this.message = 'Error connecting to server.';
          }
        }
      });
  }
}

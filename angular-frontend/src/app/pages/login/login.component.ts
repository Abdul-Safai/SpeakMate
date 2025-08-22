import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
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
    if (this.loading) return;
    this.message = '';

    const email = this.email.trim().toLowerCase();
    const password = this.password; // no trim while debugging

    console.log('[Login] sending payload', {
      email,
      pwLen: password?.length ?? 0,
      pwPreview: (password ?? '').slice(0, 2) + '***'
    });

    if (!email || !password) {
      this.message = 'Please fill in all fields.';
      return;
    }

    this.loading = true;

    this.http.post<any>(
      'http://localhost/SpeakMate/backend/api/login.php',
      { email, password },
      { observe: 'response' }
    ).subscribe({
      next: (res: HttpResponse<any>) => {
        this.loading = false;

        const body = res.body;
        if (body?.success && body?.user) {
          const user: AuthUser = {
            id: body.user.id,
            email: body.user.email,
            full_name: body.user.full_name
          };
          this.session.login(user);
          this.router.navigate(['/dashboard']);
        } else {
          this.message = body?.error || 'Login failed.';
        }
      },
      error: (err) => {
        this.loading = false;

        // Read debug headers from server
        try {
          console.error('[Login] 401/err headers', {
            branch: err?.headers?.get?.('X-Auth-Branch'),
            db: err?.headers?.get?.('X-DB-Name'),
            emailLower: err?.headers?.get?.('X-Email-Lower'),
            userId: err?.headers?.get?.('X-User-Id'),
            hashLen: err?.headers?.get?.('X-Hash-Len'),
            hashPrefix: err?.headers?.get?.('X-Hash-Prefix'),
            pwLen: err?.headers?.get?.('X-PW-Len'),
            pwHex: err?.headers?.get?.('X-PW-Hex')
          });
        } catch {}

        if (err.status === 401) {
          this.message = 'Invalid email or password.';
        } else if (err.status === 0) {
          this.message = 'Cannot reach server (CORS/network).';
        } else {
          this.message = err?.error?.error || 'Error connecting to server.';
        }
      }
    });
  }
}

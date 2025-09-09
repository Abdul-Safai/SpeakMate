// src/app/pages/forgot-password/forgot-password.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  error = '';
  loading = false;

  constructor(private http: HttpClient) {}

  sendResetLink() {
    if (this.loading) return;

    this.message = '';
    this.error = '';

    const email = this.email.trim().toLowerCase();
    if (!email) {
      this.error = 'Please enter your email.';
      return;
    }

    this.loading = true;

    // Adjust endpoint if your backend uses a different path/name
    this.http.post<any>('http://localhost/SpeakMate/backend/api/forgot-password.php', { email })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res?.success) {
            this.message = res?.message || 'If this email exists, a reset link has been sent.';
          } else {
            this.error = res?.error || 'Unable to send reset link.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error =
            err?.error?.error ||
            (err.status === 0 ? 'Cannot reach server (CORS/network).' : 'Error connecting to server.');
        }
      });
  }
}

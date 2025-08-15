import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {
  token = '';
  newPassword = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  resetPassword(event: Event) {
    event.preventDefault();
    if (!this.token || !this.newPassword) {
      this.message = 'Please enter your new password.';
      return;
    }

    const payload = {
      token: this.token,
      new_password: this.newPassword
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<any>(
      'http://localhost/SpeakMate/backend/api/reset_password.php',
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.message = 'Password updated successfully.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.message = res.error || 'Password reset failed.';
        }
      },
      error: (err) => {
        console.error('Reset Error:', err);
        this.message = 'Error communicating with server.';
      }
    });
  }
}

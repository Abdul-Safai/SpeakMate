import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['../login/login.css', './forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(private http: HttpClient) {}

  sendResetLink() {
    this.message = '';
    this.error = '';

    if (!this.email) {
      this.error = 'Email is required.';
      return;
    }

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email: this.email };

    this.http.post<any>(
      'http://localhost/SpeakMate/backend/api/send_reset_link.php',
      body,
      { headers }
    ).subscribe({
      next: (response) => {
        console.log('✅ Response:', response); // <-- ✅ LOG SUCCESSFUL RESPONSE
        if (response.success) {
          this.message = response.message;
          this.email = '';
        } else {
          this.error = response.error || 'Failed to send reset email.';
        }
      },
      error: (err) => {
        console.error('❌ Error sending email:', err); // <-- ✅ LOG ERROR RESPONSE
        this.error = err?.error?.error || 'Error sending reset email.';
      }
    });
  }
}

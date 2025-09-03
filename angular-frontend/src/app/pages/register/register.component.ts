import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  message = '';
  messageType: 'success' | 'error' = 'success';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  registerUser() {
    if (this.loading) return;
    this.message = '';
    this.messageType = 'success';

    const payload = {
      full_name: this.fullName.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password.trim(),
    };

    if (!payload.full_name || !payload.email || !payload.password) {
      this.messageType = 'error';
      this.message = 'Please fill in all fields.';
      return;
    }

    this.loading = true;

    this.http.post<any>('http://localhost/SpeakMate/backend/api/register.php', payload)
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log('✅ Registration response:', response);
          this.messageType = 'success';
          this.message = response?.message || 'Registration successful! Redirecting to login…';
          this.resetForm();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          console.error('❌ Registration error:', error);
          this.messageType = 'error';
          this.message = error?.error?.error || 'Error connecting to server.';
        }
      });
  }

  private resetForm() {
    this.fullName = '';
    this.email = '';
    this.password = '';
  }
}

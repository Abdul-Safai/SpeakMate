import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  constructor(private http: HttpClient, private router: Router) {}

  registerUser(event: Event) {
    event.preventDefault();

    const payload = {
      full_name: this.fullName.trim(),
      email: this.email.trim().toLowerCase(), // ✅ force lowercase before saving
      password: this.password.trim()
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(
      'http://localhost/SpeakMate/backend/api/register.php',
      payload,
      { headers }
    ).subscribe({
      next: (response) => {
        console.log('✅ Registration response:', response);
        this.messageType = 'success';
        this.message = response.message || 'Registration successful!';
        this.resetForm();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        this.messageType = 'error';
        this.message = error.error?.error || 'Error connecting to server.';
      }
    });
  }

  private resetForm() {
    this.fullName = '';
    this.email = '';
    this.password = '';
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) {}

  loginUser(event: Event) {
    event.preventDefault();
    this.message = '';

    const trimmedEmail = this.email.trim();
    const trimmedPassword = this.password.trim();

    console.log('Email entered:', `"${trimmedEmail}"`);
    console.log('Password entered:', `"${trimmedPassword}"`);

    if (!trimmedEmail || !trimmedPassword) {
      this.message = 'Please fill in all fields.';
      return;
    }

    const payload = {
      email: trimmedEmail,
      password: trimmedPassword
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post<any>(
      'http://localhost/SpeakMate/backend/api/login.php',
      payload,
      { headers }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.message = res.error || 'Login failed.';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 401) {
          this.message = 'Invalid email or password.';
        } else {
          this.message = 'Error connecting to server.';
        }
      }
    });
  }
}

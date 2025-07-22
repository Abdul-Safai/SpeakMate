import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css', '../home/home.css']  // 👈 Reuse home styles
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  loginUser(event: Event) {
    event.preventDefault();
    if (!this.email || !this.password) {
      this.message = 'Please fill in all fields.';
      return;
    }

    const payload = { email: this.email, password: this.password };
    this.http.post<any>('http://localhost/SpeakMate/backend/api/login.php', payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.message = res.error || 'Login failed';
        }
      },
      error: () => {
        this.message = 'Error connecting to server.';
      }
    });
  }
}

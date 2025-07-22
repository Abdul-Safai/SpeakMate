import { Component } from '@angular/core';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  message = '';

  constructor(private http: HttpClient) {}

  registerUser(event: Event) {
    event.preventDefault();

    const payload = {
      full_name: this.fullName,
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost/SpeakMate/backend/api/register.php', payload)
      .subscribe({
        next: (response) => {
          this.message = response.message || 'Registration successful!';
        },
        error: (error) => {
          console.error(error);
          this.message = error.error?.error || 'Error connecting to server.';
        }
      });
  }
}

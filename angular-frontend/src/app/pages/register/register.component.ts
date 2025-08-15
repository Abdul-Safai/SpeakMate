import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ IMPORT THIS

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ ADD RouterModule
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

    this.http.post<any>('http://localhost/SpeakMate/backend/api/register.php', payload).subscribe({
      next: (response) => {
        this.message = response.message || 'Registration successful!';
        this.resetForm();
      },
      error: (error) => {
        console.error(error);
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

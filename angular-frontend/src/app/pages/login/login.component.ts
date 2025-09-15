import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  // 👇 add the same shared header/footer styles used by Register
  styleUrls: ['./login.css', '../home/home.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  message = '';

  constructor(private auth: AuthService, private router: Router) {}

  async loginUser(): Promise<void> {
    if (this.loading) return;
    this.message = '';
    this.loading = true;
    try {
      await this.auth.login({ email: this.email.trim(), password: this.password });
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.message = e?.error?.message || 'Login failed. Check your credentials.';
    } finally {
      this.loading = false;
    }
  }
}

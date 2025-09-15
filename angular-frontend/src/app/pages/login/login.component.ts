// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css', '../home/home.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  message: string | null = null; // error/info under the form
  banner: string | null = null;  // green success banner

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Prefer router state flash (from Register)
    const nav = history.state as any;
    if (nav?.flash) this.banner = String(nav.flash);

    // Fallback: ?registered=1
    this.route.queryParamMap.subscribe((p) => {
      if (!this.banner && p.get('registered') === '1') {
        this.banner = 'Account created! Please log in.';
      }
    });

    // Optional: auto-dismiss after 5s
    if (this.banner) {
      setTimeout(() => (this.banner = null), 5000);
    }
  }

  async loginUser(f: NgForm) {
    if (!f.valid || this.loading) return;
    this.loading = true;
    this.message = null;
    try {
      await this.auth.login({ email: this.email.trim(), password: this.password });
      this.router.navigateByUrl('/dashboard');
    } catch (e: any) {
      this.message = e?.message || 'Login failed.';
    } finally {
      this.loading = false;
    }
  }
}

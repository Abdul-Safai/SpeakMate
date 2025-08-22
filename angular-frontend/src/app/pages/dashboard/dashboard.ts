import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css', '../home/home.css'] // reuse header/footer styles
})
export class DashboardComponent {
  userName = 'User';
  currentYear = new Date().getFullYear();

  constructor(private session: AuthService, private router: Router) {
    const u = this.session.user;
    this.userName = u?.full_name || u?.email || this.userName;

    // Optional guard: if no user, go back to login
    if (!u) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.session.logout();
    this.router.navigate(['/login']);
  }
}

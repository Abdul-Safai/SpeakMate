import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css', '../home/home.css'],
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}

  get user(): AuthUser | null {
    return this.auth.user;
  }
}

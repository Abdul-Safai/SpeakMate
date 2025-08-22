import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  userName = 'User';

  constructor(private session: AuthService) {
    const u = this.session.user;
    this.userName = u?.full_name || u?.email || this.userName;
  }
}

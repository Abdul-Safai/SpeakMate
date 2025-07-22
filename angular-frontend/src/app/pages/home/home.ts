import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Add this to use [routerLink]

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule], // ✅ Include RouterModule here
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  // Optional scroll button
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isVisible = true; // Required if you're using *ngIf on the scroll button
}

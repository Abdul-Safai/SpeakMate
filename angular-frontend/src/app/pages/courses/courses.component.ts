import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css', '../home/home.css'] // page styles + header/footer styles
})
export class CoursesComponent implements OnInit {
  isVisible = false; // controls the scroll-to-top button

  ngOnInit(): void {
    this.onScroll(); // initialize if user lands mid-page
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isVisible = window.scrollY > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

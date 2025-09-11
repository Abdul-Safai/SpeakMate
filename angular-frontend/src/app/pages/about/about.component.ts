// src/app/pages/about/about.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css', '../home/home.css'] // keeps your header/footer styles
})
export class AboutComponent implements OnInit {
  isVisible = false;

  ngOnInit() {
    this.onScroll(); // initialize visibility in case user lands mid-page
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isVisible = window.scrollY > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

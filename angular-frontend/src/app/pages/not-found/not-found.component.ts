import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="min-height:60vh;display:flex;align-items:center;justify-content:center;padding:40px">
      <div style="text-align:center;max-width:560px">
        <h1 style="margin:0 0 12px;font-size:2rem;">Page not found</h1>
        <p style="color:#666;margin:0 0 20px;">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <a routerLink="/" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#00703c;color:#fff;text-decoration:none;">
          Go to Home
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}

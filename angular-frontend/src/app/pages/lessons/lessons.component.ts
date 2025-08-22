import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-lessons',
  imports: [CommonModule],
  template: `<div class="page-wrapper">
    <main class="content-wrapper container" style="padding:24px">
      <h2>Lessons</h2>
      <p>Continue where you left off.</p>
    </main>
  </div>`
})
export class LessonsComponent {}

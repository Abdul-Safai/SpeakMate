import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-progress',
  imports: [CommonModule],
  template: `<div class="page-wrapper">
    <main class="content-wrapper container" style="padding:24px">
      <h2>Progress</h2>
      <p>See your improvement over time.</p>
    </main>
  </div>`
})
export class ProgressComponent {}

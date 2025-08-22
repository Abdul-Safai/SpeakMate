import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-resources',
  imports: [CommonModule],
  template: `<div class="page-wrapper">
    <main class="content-wrapper container" style="padding:24px">
      <h2>Resources</h2>
      <p>Practice materials & tips.</p>
    </main>
  </div>`
})
export class ResourcesComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule],
  template: `<div class="page-wrapper">
    <main class="content-wrapper container" style="padding:24px">
      <h2>My Profile</h2>
      <p>Manage your account details.</p>
    </main>
  </div>`
})
export class ProfileComponent {}

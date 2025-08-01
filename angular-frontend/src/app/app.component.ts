import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<h1>SpeakMate App Loaded</h1><router-outlet></router-outlet>`,
  styleUrls: []
})
export class AppComponent {}

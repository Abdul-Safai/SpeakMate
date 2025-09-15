import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard'; // ✅ import the class

export const routes: Routes = [
  // Default landing
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Pages (keep paths matching your actual files)
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/courses/courses.component').then(m => m.CoursesComponent),
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./pages/resources/resources').then(m => m.ResourcesComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },

  // Protected
  {
    path: 'dashboard',
    canActivate: [AuthGuard], // ✅ use the class here
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
  },

  // Fallback
  { path: '**', redirectTo: 'home' },
];

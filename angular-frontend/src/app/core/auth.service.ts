import { Injectable } from '@angular/core';

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'speakmate_user';

  /** Save user object after successful login */
  login(user: AuthUser): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /** Get current user (or null) */
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  }

  /** Is someone logged in? */
  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  /** Clear session */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

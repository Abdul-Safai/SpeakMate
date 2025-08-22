import { Injectable } from '@angular/core';

export interface AuthUser {
  id: number | string;
  email: string;
  full_name: string;
  token?: string;
}

const KEY = 'speakmate_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  get user(): AuthUser | null {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  }

  login(user: AuthUser): void {
    localStorage.setItem(KEY, JSON.stringify(user));
  }

  logout(): void {
    localStorage.removeItem(KEY);
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }
}

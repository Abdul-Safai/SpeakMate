import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  id: number | string;
  email: string;
  full_name: string;
  token?: string;           // JWT or session token from your PHP API
}

const KEY = 'speakmate_user';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AuthUser | null>(safeParse<AuthUser>(localStorage.getItem(KEY)));
  readonly user$ = this._user$.asObservable();

  /** Current user snapshot */
  get user(): AuthUser | null {
    return this._user$.value;
  }

  /** Raw token string (if any) */
  get token(): string | undefined {
    return this.user?.token || undefined;
  }

  /** Basic login: persist and notify */
  login(user: AuthUser): void {
    localStorage.setItem(KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  /** Replace current user (e.g., refresh token or profile) */
  setUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEY);
    }
    this._user$.next(user);
  }

  /** Logout/clear */
  logout(): void {
    localStorage.removeItem(KEY);
    this._user$.next(null);
  }

  /** Extra safety: clear everything related to auth */
  clear(): void {
    this.logout();
  }

  /** Check if logged in; if token is JWT, also verify expiry */
  isLoggedIn(): boolean {
    const u = this.user;
    if (!u) return false;

    // If you’re not using JWTs, just return !!u.token || true
    if (!u.token) return true;

    // JWT expiry check (optional)
    try {
      const payload = JSON.parse(atob(u.token.split('.')[1] || ''));
      if (payload?.exp && typeof payload.exp === 'number') {
        return payload.exp * 1000 > Date.now();
      }
      return true; // No exp in token → treat as valid
    } catch {
      // Non-JWT token → treat as valid
      return true;
    }
  }
}

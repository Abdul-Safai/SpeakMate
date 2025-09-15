// src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export type UserRole = 'student' | 'instructor' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  token?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api'; // proxied to PHP
  private readonly STORAGE_KEY = 'auth_user';
  private _user$ = new BehaviorSubject<AuthUser | null>(null);

  constructor(private http: HttpClient) {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      try { this._user$.next(JSON.parse(cached) as AuthUser); }
      catch { localStorage.removeItem(this.STORAGE_KEY); }
    }
  }

  // Observables & getters
  get user$() { return this._user$.asObservable(); }
  get user(): AuthUser | null { return this._user$.value; }
  get isLoggedIn(): boolean { return !!this._user$.value; }

  private save(user: AuthUser | null) {
    if (user) localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(this.STORAGE_KEY);
    this._user$.next(user);
  }

  // ---- Verify instructor/admin secret (server-side)
  async verifySecret(role: UserRole, code: string): Promise<{ ok: boolean; error?: string }> {
    return await firstValueFrom(
      this.http.post<{ ok: boolean; error?: string }>(
        `${this.API}/verify-secret.php`,
        { role, code }
      )
    );
  }

  // ---- Login (maps your PHP { success, user } shape) and persists the session
  async login(body: { email: string; password: string }): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.post<any>(`${this.API}/login.php`, body));
      if (!res?.success || !res?.user) throw new Error(res?.error || 'Invalid response from server');
      const u = res.user;
      this.save({
        id: String(u.id),
        fullName: u.full_name ?? u.fullName ?? '',
        email: u.email,
        role: (u.role ?? 'student') as UserRole,
        token: res?.token ?? u?.token ?? null,
      });
    } catch (e: any) {
      const msg = e?.error?.error || e?.message || 'Login failed. Please try again.';
      throw new Error(msg);
    }
  }

  // ---- Register (does NOT log the user in; leaves them signed out)
  async register(body: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    secretCode?: string;
  }): Promise<void> {
    try {
      const res = await firstValueFrom(this.http.post<any>(`${this.API}/register.php`, body));
      if (res?.error) throw new Error(res.error);
      // IMPORTANT: do NOT call this.save(...) here.
      // Registration success leaves user logged out so UI can redirect to /login.
      return;
    } catch (e: any) {
      const msg = e?.error?.error || e?.message || 'Registration failed.';
      throw new Error(msg);
    }
  }

  logout(): void { this.save(null); }
}

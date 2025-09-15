import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export type UserRole = 'student' | 'instructor' | 'admin';
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  token?: string; // e.g., JWT if your API returns one
}

@Injectable({ providedIn: 'root' })
export class AuthService {
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

  // -------- API calls --------

  // Registers a user. Server validates instructor/admin secret.
  async register(body: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    secretCode?: string;
  }): Promise<void> {
    await firstValueFrom(this.http.post('/api/register', body));
    // If your API auto-logs in and returns a user, call this.save(user) here.
  }

  // Logs in and stores the returned user
  async login(body: { email: string; password: string }): Promise<void> {
    const user = await firstValueFrom(
      this.http.post<AuthUser>('/api/login', body)
    );
    this.save(user);
  }

  logout(): void {
    this.save(null);
  }
}

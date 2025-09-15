import { Injectable } from '@angular/core';
import {
  CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot,
  CanMatch, Route, UrlSegment
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanMatch {
  constructor(private auth: AuthService, private router: Router) {}

  private handleAuth(): boolean | UrlTree {
    return this.auth.isLoggedIn ? true : this.router.createUrlTree(['/login']);
  }

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.handleAuth();
  }

  canMatch(_route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    return this.handleAuth();
  }
}

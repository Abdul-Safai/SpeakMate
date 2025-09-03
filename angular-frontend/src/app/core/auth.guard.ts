import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanMatchFn,
  Router,
  UrlTree,
  UrlSegment,
} from '@angular/router';
import { AuthService } from './auth.service';

/** Protects routes (e.g., /dashboard). If not logged in, redirects to /login?returnUrl=... */
export const authGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/** Optional: block loading of lazy routes too (use canMatch instead of canActivate) */
export const authMatchGuard: CanMatchFn = (_route, segments): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  const url = '/' + segments.map((s: UrlSegment) => s.path).join('/');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
};

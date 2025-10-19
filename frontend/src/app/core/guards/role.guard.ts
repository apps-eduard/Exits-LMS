import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredScope = route.data['requiredScope'];

  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredScope && user.roleScope !== requiredScope) {
    // Redirect based on actual role
    if (user.roleScope === 'platform') {
      router.navigate(['/super-admin']);
    } else {
      router.navigate(['/tenant']);
    }
    return false;
  }

  return true;
};

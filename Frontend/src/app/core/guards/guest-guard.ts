import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';




export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log("guest guard called");

  return authService.isLoggedIn().pipe(
      map(() => router.createUrlTree(['/feed'])),
      catchError(() => of(true))
    );
};

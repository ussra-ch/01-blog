import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  // console.log("guard called");
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(

      map(() => {
        // console.log("guard allows access");
        return true;
      }),

      catchError(() => {
        console.log("guard blocks access");
        return of(router.createUrlTree(['/login']));
      })
    );
};

// export const authGuard: CanActivateFn = () => {

//   console.log("guard called");

//   return true;
// };

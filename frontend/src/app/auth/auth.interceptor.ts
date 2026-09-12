import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(request).pipe(catchError(error => {
    if (request.url.startsWith('/api/') && !request.url.startsWith('/api/auth/')) {
      if (error.status === 401) {
        auth.user.set(null);
        void router.navigate(['/login']);
      } else if (error.status === 403) {
        // Refresh authentication/CSRF state, but never replay a write request.
        auth.check().subscribe({
          next: user => { if (!user) void router.navigate(['/login']); },
          error: () => {},
        });
      }
    }
    return throwError(() => error);
  }));
};

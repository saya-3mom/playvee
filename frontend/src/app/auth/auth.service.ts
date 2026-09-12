import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, of, switchMap, tap, throwError } from 'rxjs';

export interface CurrentUser { id: number; loginId: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly user = signal<CurrentUser | null | undefined>(undefined);
  readonly message = signal('');

  csrf() { return this.http.get<void>('/api/auth/csrf'); }

  check() {
    return this.csrf().pipe(switchMap(() => this.http.get<CurrentUser>('/api/auth/me')),
      tap(user => { this.user.set(user); this.message.set(''); }),
      catchError(error => {
        if (error.status === 401) { this.user.set(null); return of(null); }
        this.message.set('サーバーに接続できませんでした。再度お試しください。');
        return throwError(() => error);
      }));
  }

  login(loginId: string, password: string) {
    return this.csrf().pipe(switchMap(() => this.http.post<void>('/api/auth/login',
      new HttpParams().set('loginId', loginId).set('password', password))),
      switchMap(() => this.check()));
  }

  logout() {
    return this.csrf().pipe(switchMap(() => this.http.post<void>('/api/auth/logout', {})),
      tap(() => this.user.set(null)), switchMap(() => this.csrf()));
  }
}

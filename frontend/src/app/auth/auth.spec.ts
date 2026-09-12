import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('Authentication', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([]),
    ] });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => http.verify());

  it('refreshes CSRF before and after login and restores the user from the server', () => {
    auth.login('owner', 'test-only').subscribe();
    http.expectOne('/api/auth/csrf').flush(null);
    const login = http.expectOne('/api/auth/login');
    expect(login.request.method).toBe('POST');
    expect(login.request.body.get('loginId')).toBe('owner');
    login.flush(null);
    http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/auth/me').flush({ id: 1, loginId: 'owner' });
    expect(auth.user()?.loginId).toBe('owner');
  });

  it('treats an expired session as anonymous', () => {
    auth.check().subscribe(user => expect(user).toBeNull());
    http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/auth/me').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(auth.user()).toBeNull();
  });

  it('clears the user on logout and fetches a fresh CSRF token', () => {
    auth.user.set({ id: 1, loginId: 'owner' });
    auth.logout().subscribe();
    http.expectOne('/api/auth/csrf').flush(null);
    http.expectOne('/api/auth/logout').flush(null);
    http.expectOne('/api/auth/csrf').flush(null);
    expect(auth.user()).toBeNull();
  });

  it('redirects a protected API 401 without retrying the request', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    TestBed.inject(HttpClient).post('/api/parks', {}).subscribe({ error: () => {} });
    http.expectOne('/api/parks').flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(auth.user()).toBeNull();
  });
});

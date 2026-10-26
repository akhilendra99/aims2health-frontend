import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let isAuthenticated: boolean;
  let role: string;
  let router: jasmine.SpyObj<Router>;
  let guard: AuthGuard;

  beforeEach(() => {
    isAuthenticated = true;
    role = 'p';
    router = jasmine.createSpyObj<Router>('Router', ['parseUrl']);
    router.parseUrl.and.returnValue({} as any);
    guard = new AuthGuard(
      { getIsAuth: () => isAuthenticated, getUserRole: () => role } as any,
      router
    );
  });

  it('allows a signed-in user with the route role', () => {
    const route = { data: { roles: ['p'] } } as ActivatedRouteSnapshot;
    expect(guard.canActivate(route, null)).toBeTrue();
  });

  it('rejects a signed-in user with a different role on direct navigation', () => {
    role = 'p';
    const route = { data: { roles: ['a'] } } as ActivatedRouteSnapshot;
    expect(guard.canActivate(route, null)).toBe(router.parseUrl.calls.first().returnValue);
  });

  it('rejects unauthenticated navigation even when local role matches', () => {
    isAuthenticated = false;
    const route = { data: { roles: ['p'] } } as ActivatedRouteSnapshot;
    expect(guard.canActivate(route, null)).toBe(router.parseUrl.calls.first().returnValue);
  });

  it('rejects protected routes without explicit role metadata', () => {
    const route = { data: {} } as ActivatedRouteSnapshot;
    expect(guard.canActivate(route, null)).toBe(router.parseUrl.calls.first().returnValue);
  });

  it('rejects an unknown client role', () => {
    role = 'superadmin';
    const route = { data: { roles: ['a'] } } as ActivatedRouteSnapshot;
    expect(guard.canActivate(route, null)).toBe(router.parseUrl.calls.first().returnValue);
  });
});

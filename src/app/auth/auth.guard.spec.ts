import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
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
      {
        initializeSession: () => of(void 0),
        getIsAuth: () => isAuthenticated,
        getUserRole: () => role,
      } as any,
      router
    );
  });

  it('allows a signed-in user with the route role after initialization', async () => {
    const route = { data: { roles: ['p'] } } as unknown as ActivatedRouteSnapshot;
    await expectAsync(firstValueFrom(guard.canActivate(route, null) as any)).toBeResolvedTo(true);
  });

  it('rejects a signed-in user with a different role on direct navigation', async () => {
    role = 'p';
    const route = { data: { roles: ['a'] } } as unknown as ActivatedRouteSnapshot;
    await expectAsync(firstValueFrom(guard.canActivate(route, null) as any))
      .toBeResolvedTo(router.parseUrl.calls.first().returnValue);
  });

  it('rejects unauthenticated navigation even when local role matches', async () => {
    isAuthenticated = false;
    const route = { data: { roles: ['p'] } } as unknown as ActivatedRouteSnapshot;
    await expectAsync(firstValueFrom(guard.canActivate(route, null) as any))
      .toBeResolvedTo(router.parseUrl.calls.first().returnValue);
  });

  it('rejects protected routes without explicit role metadata', async () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;
    await expectAsync(firstValueFrom(guard.canActivate(route, null) as any))
      .toBeResolvedTo(router.parseUrl.calls.first().returnValue);
  });

  it('rejects an unknown client role', async () => {
    role = 'superadmin';
    const route = { data: { roles: ['a'] } } as unknown as ActivatedRouteSnapshot;
    await expectAsync(firstValueFrom(guard.canActivate(route, null) as any))
      .toBeResolvedTo(router.parseUrl.calls.first().returnValue);
  });
});

import { Router } from '@angular/router';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AuthSessionResponse, AuthService } from './auth.service';
import { environment } from '../../environments/environment';

const sessionByRole: AuthSessionResponse[] = [
  { role: 'patient', expiresIn: 1200, userId: 21, userEmail: 'patient@example.test', userName: 'Pat Example' },
  { role: 'doctor', expiresIn: 1200, userId: 22, userEmail: 'doctor@example.test', userName: 'Doc Example' },
  { role: 'admin', expiresIn: 1200, userId: 23, userEmail: 'admin@example.test', userName: 'admin@example.test' },
  {
    role: 'helper', expiresIn: 1200, userId: 24,
    userEmail: 'helper@example.test', userName: '',
    user: { helper_id: 24, email_id: 'helper@example.test', mobile: '5551234567' },
  },
];

describe('VAPT #16 cookie-validated session bootstrap', () => {
  let http: any;
  let router: jasmine.SpyObj<Router>;
  let auth: AuthService;

  function createAuth() {
    http = {
      get: jasmine.createSpy('get'),
      post: jasmine.createSpy('post').and.returnValue(of({})),
    };
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
    router.navigate.and.returnValue(Promise.resolve(true));
    router.parseUrl.and.callFake((path: string) => ({ redirectTo: path } as any));
    const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    auth = new AuthService(http, router, toastr, { run: (fn: () => void) => fn() } as any);
  }

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    auth?.logout();
    localStorage.clear();
    sessionStorage.clear();
  });

  for (const response of sessionByRole) {
    it(`restores ${response.role} identity and profile only in memory`, async () => {
      createAuth();
      http.get.and.returnValue(of(response));
      localStorage.setItem('token', 'old-token');
      localStorage.setItem('userId', 'forged-id');
      sessionStorage.setItem('temp', 'legacy-payment-handoff');

      await firstValueFrom(auth.initializeSession());

      const expectedRole = { patient: 'p', doctor: 'd', admin: 'a', helper: 'h' }[response.role];
      expect(http.get).toHaveBeenCalledOnceWith(
        `${environment.apiURL}/auth/session`, { withCredentials: true }
      );
      expect(auth.getIsAuth()).toBeTrue();
      expect(auth.getUserRole()).toBe(expectedRole);
      expect(auth.getLoginType()).toBe(response.role[0].toUpperCase() + response.role.slice(1));
      expect(auth.getUserId()).toBe(response.userId);
      expect(auth.getUserEmail()).toBe(response.userEmail);
      expect(auth.getUserName()).toBe(response.userName);
      expect(auth.getSessionStatus()).toBe('authenticated');
      expect(auth.getUserProfile()).toEqual(response.user || null);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(sessionStorage.getItem('temp')).toBeNull();
    });
  }

  it('holds a protected-route decision until startup session validation completes', async () => {
    createAuth();
    const pendingSession = new Subject<AuthSessionResponse>();
    http.get.and.returnValue(pendingSession);
    auth.initializeSession().subscribe(); // AppComponent startup subscription.
    const guard = new AuthGuard(auth, router);
    const decision = firstValueFrom(guard.canActivate({ data: { roles: ['p'] } } as any, {} as any) as any);

    expect(auth.getSessionStatus()).toBe('initializing');
    expect(http.get).toHaveBeenCalledTimes(1);

    pendingSession.next(sessionByRole[0]);
    pendingSession.complete();

    expect(await decision).toBeTrue();
    expect(auth.getUserRole()).toBe('p');
    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('rejects a valid session when the requested route belongs to another role', async () => {
    createAuth();
    http.get.and.returnValue(of(sessionByRole[0]));
    const guard = new AuthGuard(auth, router);

    const decision = await firstValueFrom(
      guard.canActivate({ data: { roles: ['a'] } } as any, {} as any) as any
    );

    expect(auth.getIsAuth()).toBeTrue();
    expect(decision).toEqual({ redirectTo: '/' });
  });

  it('leaves missing, expired, or revoked cookie sessions unauthenticated after backend 401', async () => {
    createAuth();
    http.get.and.returnValue(throwError(() => ({ status: 401 })));

    await firstValueFrom(auth.initializeSession());

    expect(auth.getIsAuth()).toBeFalse();
    expect(auth.getUserRole()).toBeNull();
    expect(auth.getSessionStatus()).toBe('unauthenticated');
  });

  it('fails closed on network/503 errors and does not retry or redirect-loop', async () => {
    createAuth();
    http.get.and.returnValue(throwError(() => ({ status: 503 })));
    const guard = new AuthGuard(auth, router);

    const first = await firstValueFrom(guard.canActivate({ data: { roles: ['d'] } } as any, {} as any) as any);
    const second = await firstValueFrom(guard.canActivate({ data: { roles: ['d'] } } as any, {} as any) as any);

    expect(first).toEqual({ redirectTo: '/' });
    expect(second).toEqual({ redirectTo: '/' });
    expect(auth.getIsAuth()).toBeFalse();
    expect(auth.getSessionStatus()).toBe('unauthenticated');
    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('does not let a late invalid bootstrap response overwrite a successful login', async () => {
    createAuth();
    const pendingSession = new Subject<AuthSessionResponse>();
    http.get.and.returnValue(pendingSession);
    http.post.and.returnValue(of({
      expiresIn: 1200, userId: 22, userEmail: 'doctor@example.test', userName: 'Doc Example',
    }));
    auth.initializeSession().subscribe();
    auth.loginDoc('doctor@example.test', 'password');

    pendingSession.error({ status: 401 });
    await firstValueFrom(auth.initializeSession());

    expect(auth.getIsAuth()).toBeTrue();
    expect(auth.getUserRole()).toBe('d');
    expect(auth.getSessionStatus()).toBe('authenticated');
  });

  it('keeps login and logout in-memory and clears the session on logout', async () => {
    createAuth();
    http.get.and.returnValue(of(sessionByRole[1]));
    await firstValueFrom(auth.initializeSession());
    auth.logout();

    expect(http.post).toHaveBeenCalledWith(`${environment.apiURL}/doctor/logout`, {});
    expect(auth.getIsAuth()).toBeFalse();
    expect(auth.getUserRole()).toBeNull();
    expect(auth.getUserId()).toBeNull();
    expect(auth.getSessionStatus()).toBe('unauthenticated');
  });
});

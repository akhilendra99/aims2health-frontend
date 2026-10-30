import { HttpHeaders } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { getLoginErrorMessage } from './login-error-feedback';
import { NewHelperLoginComponent } from '../new-helper/login/new-helper-login.component';
import { PloginComponent } from '../patient/pauth/plogin/plogin.component';

describe('VAPT #11 login rate-limit feedback', () => {
  let http: any;
  let toastr: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    jasmine.clock().install();
    http = { post: jasmine.createSpy('post') };
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));
    localStorage.clear();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    localStorage.clear();
  });

  it('uses generic credential text and does not expose backend error details', () => {
    const generic = 'Unable to sign in with those details. Please try again.';
    expect(getLoginErrorMessage({ status: 401, error: { message: 'Email does not exist' } })).toBe(generic);
    expect(getLoginErrorMessage({ status: 401, error: { message: 'Password is wrong' } })).toBe(generic);
    expect(getLoginErrorMessage({ status: 500, error: { message: 'SQL exception' } })).toBe(generic);
  });

  it('shows the backend 429 limit message and uses only a valid Retry-After duration', () => {
    expect(getLoginErrorMessage({ status: 429, error: { message: 'internal limiter detail' } }))
      .toBe('Too many login attempts. Please try again later.');
    expect(getLoginErrorMessage({
      status: 429,
      headers: new HttpHeaders({ 'Retry-After': '90' }),
    })).toBe('Too many login attempts. Please try again in about 2 minutes.');
    expect(getLoginErrorMessage({
      status: 429,
      headers: new HttpHeaders({ 'Retry-After': 'invalid' }),
    })).toBe('Too many login attempts. Please try again later.');
  });

  it('handles login failures generically for doctor, admin and legacy helper endpoints', () => {
    http.post.and.returnValue(throwError(() => ({
      status: 429,
      error: { message: 'Too many login attempts. Please try again later.' },
    })));
    const auth = new AuthService(http, router, toastr, { run: (callback: () => void) => callback() } as any);

    auth.loginDoc('person@example.com', 'password');
    auth.loginAdmin('person@example.com', 'password');
    auth.loginHelper('person@example.com', 'password', 'patient@example.com');

    expect(toastr.error.calls.allArgs().map((args) => args[0])).toEqual([
      'Too many login attempts. Please try again later.',
      'Too many login attempts. Please try again later.',
      'Too many login attempts. Please try again later.',
    ]);
    expect(auth.getIsAuth()).toBeFalse();
  });

  it('allows valid doctor, admin and current helper API responses to establish their existing routes', () => {
    http.post.and.callFake((url: string) => {
      if (url.endsWith('/doctor/login')) return of({ expiresIn: 3600, userId: 11, userEmail: 'd@example.com', userName: 'Doc' });
      if (url.endsWith('/admin/login')) return of({ expiresIn: 3600, userId: 12, userName: 'Admin' });
      return of({ message: 'Login successful', user: { helper_id: 13, email_id: 'h@example.com' } });
    });
    const auth = new AuthService(http, router, toastr, { run: (callback: () => void) => callback() } as any);

    auth.loginDoc('d@example.com', 'password');
    auth.loginAdmin('a@example.com', 'password');
    auth.loginHelper('h@example.com', 'password', 'patient@example.com');

    expect(router.navigate.calls.allArgs()).toEqual([
      [['/ddashboard']],
      [['/validatedoc']],
      [['/helper-dashboard']],
    ]);
    expect(auth.getLoginType()).toBe('Helper');
  });

  it('prevents duplicate patient submissions, recovers loading after failure, and permits a retry', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    http.post.and.returnValues(first, second);
    const auth = jasmine.createSpyObj('AuthService', ['establishPatientSession']);
    const component = new PloginComponent(http, toastr, router, auth);
    component.email = 'patient@example.com';
    component.password = 'candidate';

    component.onLogin();
    component.onLogin();
    expect(http.post).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTrue();

    first.error({ status: 401, error: { message: 'Account does not exist' } });
    expect(component.isLoading).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Unable to sign in with those details. Please try again.');

    component.onLogin();
    expect(http.post).toHaveBeenCalledTimes(2);
    second.next({ userId: 42, expiresIn: 3600, userEmail: 'patient@example.com' });
    expect(component.isLoading).toBeFalse();
    expect(auth.establishPatientSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/pdashboard']);
  });

  it('handles helper 429 errors, prevents duplicate sends, and releases loading state', () => {
    const pending = new Subject<any>();
    http.post.and.returnValue(pending);
    const auth = jasmine.createSpyObj('AuthService', ['establishHelperSession']);
    const component = new NewHelperLoginComponent(http, toastr, router, auth);
    component.contact = 'helper@example.com';
    component.password = 'candidate';

    component.onLogin();
    component.onLogin();
    expect(http.post).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTrue();

    pending.error({ status: 429, error: { message: 'Too many login attempts.' } });
    expect(component.isLoading).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Too many login attempts. Please try again later.');

    component.onLogin();
    expect(http.post).toHaveBeenCalledTimes(2);
  });

  it('opens the helper dashboard only for a well-formed successful helper response', () => {
    const auth = jasmine.createSpyObj('AuthService', ['establishHelperSession']);
    const component = new NewHelperLoginComponent(http, toastr, router, auth);
    component.contact = 'helper@example.com';
    component.password = 'candidate';

    http.post.and.returnValue(of({ message: 'Login successful', user: { helper_id: 13 } }));
    component.onLogin();

    expect(auth.establishHelperSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/helper-dashboard']);
    expect(component.isLoading).toBeFalse();

    router.navigate.calls.reset();
    auth.establishHelperSession.calls.reset();
    http.post.and.returnValue(of({ message: 'Login successful' }));
    component.onLogin();

    expect(auth.establishHelperSession).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith('Unable to sign in with those details. Please try again.');
    expect(component.isLoading).toBeFalse();
  });
});

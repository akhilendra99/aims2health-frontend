import { firstValueFrom, of, throwError } from 'rxjs';
import { HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthInterceptor } from './auth-interceptor';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { AdminAuthService } from '../admin/admin-auth/admin-auth.service';
import { DoctorAuthService } from '../doctor/dauth/doctor-auth.service';
import { HelperAuthService } from '../helper/hauth/helper-auth.service';
import { PatientAuthService } from '../patient/pauth/patient-auth.service';

describe('VAPT #16 sensitive browser storage remediation', () => {
  let http: any;
  let router: jasmine.SpyObj<Router>;
  let toastr: jasmine.SpyObj<any>;
  let auth: AuthService;

  beforeEach(() => {
    jasmine.clock().install();
    localStorage.clear();
    http = {
      get: jasmine.createSpy('get').and.returnValue(throwError(() => ({ status: 401 }))),
      post: jasmine.createSpy('post').and.returnValue(of({})),
    };
    router = jasmine.createSpyObj<Router>('Router', ['navigate', 'parseUrl']);
    router.navigate.and.returnValue(Promise.resolve(true));
    router.parseUrl.and.returnValue('/' as any);
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    auth = new AuthService(http, router, toastr, { run: (fn: () => void) => fn() } as any);
  });

  afterEach(() => {
    document.cookie = 'csrf_token=; Max-Age=0; path=/';
    auth.logout();
    jasmine.clock().uninstall();
    localStorage.clear();
  });

  it('does not restore authentication from editable identity/role values', async () => {
    localStorage.setItem('role', 'a');
    localStorage.setItem('userId', '9001');
    localStorage.setItem('department', 'admin');
    localStorage.setItem('expiration', new Date(Date.now() + 3600000).toISOString());
    sessionStorage.setItem('temp', JSON.stringify({ patient_id: 42 }));

    const guard = new AuthGuard(auth, router);
    const result = await firstValueFrom(guard.canActivate({ data: { roles: ['a'] } } as any, {} as any) as any);

    expect(auth.getIsAuth()).toBeFalse();
    expect(result as any).toBe('/');
    expect(http.get).toHaveBeenCalledWith(`${environment.apiURL}/auth/session`, { withCredentials: true });
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('department')).toBeNull();
    expect(sessionStorage.getItem('temp')).toBeNull();
  });

  it('keeps admin identity in memory and preserves unrelated UI preferences on logout', () => {
    localStorage.setItem('activeTab', 'details');
    http.post.and.returnValue(of({ expiresIn: 3600, userId: 42, userName: 'admin@example.com' }));

    auth.loginAdmin('admin@example.com', 'candidate');

    expect(auth.getUserRole()).toBe('a');
    expect(auth.getUserId()).toBe(42);
    expect(auth.getUserEmail()).toBe('admin@example.com');
    ['userId', 'userName', 'userEmail', 'role', 'expiration', 'department', 'token']
      .forEach((key) => expect(localStorage.getItem(key)).withContext(key).toBeNull());

    auth.logout();

    expect(localStorage.getItem('activeTab')).toBe('details');
    expect(auth.getIsAuth()).toBeFalse();
    expect(auth.getUserId()).toBeNull();
    expect(auth.getUserEmail()).toBeNull();
  });

  it('keeps helper profile details in memory without persisting the API user object', () => {
    const profile = { helper_id: 8, email_id: 'helper@example.com', mobile: '1234567890' };
    auth.establishHelperSession(profile);

    expect(auth.getUserProfile()).toEqual(profile);
    expect(auth.getUserId()).toBe(8);
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('userEmail')).toBeNull();
  });

  it('does not restore sessions in the legacy per-role authentication services', () => {
    localStorage.setItem('role', 'd');
    localStorage.setItem('userId', '123');
    const admin = new AdminAuthService(http, router);
    const doctor = new DoctorAuthService(http, router);
    const helper = new HelperAuthService(http, router);
    const patient = new PatientAuthService(http, router);

    [admin, doctor, helper, patient].forEach((service) => {
      service.autoAuthUser();
      expect(service.getIsAuth()).toBeFalse();
      expect(service.getUserId()).toBeNull();
    });
  });

  it('types patient OTP verification using the cookie-authenticated response contract', () => {
    const otpResponse = {
      expiresIn: 3600,
      userId: 42,
      userEmail: 'patient@example.com',
      userName: 'Patient Example',
    };
    http.post.and.returnValue(of(otpResponse));
    const patient = new PatientAuthService(http, router);

    patient.verifyOtp('patient@example.com', '123456').subscribe((response) => {
      expect(response).toEqual(otpResponse);
      expect('token' in response).toBeFalse();
    });

    expect(http.post).toHaveBeenCalledWith(
      `${environment.apiURL}/patient/verify-otp-login`,
      { email: 'patient@example.com', otp: '123456' }
    );
  });

  it('sends cookie credentials only to the configured backend API origin and path', () => {
    document.cookie = 'csrf_token=csrf-test; path=/';
    const next: any = {
      handle: jasmine.createSpy('handle').and.callFake((request) => of(request)),
    };
    const interceptor = new AuthInterceptor(auth);

    interceptor.intercept(new HttpRequest('POST', `${environment.apiURL}/admin/logout`, {}), next).subscribe();
    const trustedRequest = next.handle.calls.mostRecent().args[0];
    expect(trustedRequest.withCredentials).toBeTrue();
    expect(trustedRequest.headers.get('x-csrf-token')).toBe('csrf-test');

    interceptor.intercept(new HttpRequest('POST', 'https://third-party.example/collect', {}), next).subscribe();
    const externalRequest = next.handle.calls.mostRecent().args[0];
    expect(externalRequest.withCredentials).toBeFalse();
    expect(externalRequest.headers.has('x-csrf-token')).toBeFalse();

    interceptor.intercept(new HttpRequest('POST', `${new URL(environment.apiURL).origin}/outside-api`, {}), next).subscribe();
    const sameOriginOtherPath = next.handle.calls.mostRecent().args[0];
    expect(sameOriginOtherPath.withCredentials).toBeFalse();
    document.cookie = 'csrf_token=; Max-Age=0; path=/';
  });

  it('lets session bootstrap handle its own 401 without logging out a newer login', (done) => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getIsAuth', 'handleAuthenticationFailure']);
    authSpy.getIsAuth.and.returnValue(true);
    const next: any = {
      handle: jasmine.createSpy('handle').and.returnValue(
        throwError(() => ({ status: 401 }))
      ),
    };
    const interceptor = new AuthInterceptor(authSpy);

    interceptor.intercept(
      new HttpRequest('GET', `${environment.apiURL}/auth/session`),
      next
    ).subscribe({
      error: () => {
        expect(authSpy.handleAuthenticationFailure).not.toHaveBeenCalled();
        done();
      },
    });
  });
});

import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NewHelperLoginComponent } from './new-helper-login.component';
import { NewHelperRegisterComponent } from '../register/new-helper-regiester.component';

describe('Helper registration and login input validation', () => {
  let http: any;
  let toastr: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    http = { post: jasmine.createSpy('post').and.returnValue(of({ helper_id: 12, user: { helper_id: 12 } })) };
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('submits a valid helper registration and rejects a password over 72 UTF-8 bytes', () => {
    const component = new NewHelperRegisterComponent(http, toastr, router);
    component.identifier = 'helper@example.com';
    component.detectedType = 'email';
    component.isVerified = true;
    component.password = 'Strong1!';
    component.confirmPassword = 'Strong1!';
    component.updatePasswordStrength();

    component.onRegister();

    expect(http.post).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/helper-login']);

    http.post.calls.reset();
    component.password = 'A1' + 'é'.repeat(36);
    component.confirmPassword = component.password;
    component.updatePasswordStrength();
    component.onRegister();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('submits a valid helper login and rejects invalid email/phone and oversized passwords', () => {
    const authService = jasmine.createSpyObj('AuthService', ['establishHelperSession']);
    const component = new NewHelperLoginComponent(http, toastr, router, authService);
    component.contact = 'helper@example.com';
    component.password = 'valid-password';

    component.onLogin();

    expect(http.post).toHaveBeenCalled();
    expect(authService.establishHelperSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/helper-dashboard']);

    http.post.calls.reset();
    component.contact = 'not-an-email';
    component.onLogin();
    component.contact = '+1234567890';
    component.password = 'A'.repeat(73);
    component.onLogin();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('rejects an invalid helper password-reset email before calling the API', () => {
    const component = new NewHelperLoginComponent(
      http,
      toastr,
      router,
      jasmine.createSpyObj('AuthService', ['establishHelperSession'])
    );
    component.forgotPasswordEmail = 'not-an-email';

    component.onForgotPassword();

    expect(http.post).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalled();
  });

  it('shows the same generic login message for account and password failures', () => {
    const authService = jasmine.createSpyObj('AuthService', ['establishHelperSession']);
    const component = new NewHelperLoginComponent(http, toastr, router, authService);
    component.contact = 'helper@example.com';
    component.password = 'candidate-password';

    http.post.and.returnValue(throwError(() => ({ error: { message: 'Email not registered' } })));
    component.onLogin();
    const unknownAccountMessage = toastr.error.calls.mostRecent().args[0];

    http.post.and.returnValue(throwError(() => ({ error: { message: 'Incorrect password' } })));
    component.onLogin();
    const wrongPasswordMessage = toastr.error.calls.mostRecent().args[0];

    expect(unknownAccountMessage).toBe('Unable to sign in with those details. Please try again.');
    expect(wrongPasswordMessage).toBe(unknownAccountMessage);
  });

  it('does not surface account-specific recovery response or error details', () => {
    const component = new NewHelperLoginComponent(
      http,
      toastr,
      router,
      jasmine.createSpyObj('AuthService', ['establishHelperSession'])
    );
    component.forgotPasswordEmail = 'helper@example.com';

    http.post.and.returnValue(of({ message: 'If the account is eligible, password reset instructions will be sent.' }));
    component.onForgotPassword();
    const recoveryNotice = toastr.success.calls.mostRecent().args[0];
    expect(recoveryNotice).toBe('If the account is eligible, password reset instructions will be sent.');

    component.forgotPasswordEmail = 'helper@example.com';
    http.post.and.returnValue(throwError(() => ({ error: { message: 'Account not found in SQL table' } })));
    component.onForgotPassword();
    expect(toastr.error.calls.mostRecent().args[0]).toBe(
      'Unable to process that request right now. Please try again later.'
    );
  });
});

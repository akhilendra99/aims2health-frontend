import { convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { AuthService } from './auth.service';
import { DsignupComponent } from '../doctor/dauth/dsignup/dsignup.component';
import { DforgotpwdComponent } from '../doctor/dforgotpwd/dforgotpwd.component';
import { DpwdresetComponent } from '../doctor/dforgotpwd/dpwdreset/dpwdreset.component';
import { ForgotpwdComponent } from '../patient/forgotpwd/forgotpwd.component';
import { PloginComponent } from '../patient/pauth/plogin/plogin.component';
import { PsignupComponent } from '../patient/pauth/psignup/psignup.component';
import { PwdresetComponent } from '../patient/forgotpwd/pwdreset/pwdreset.component';

const GENERIC_LOGIN_ERROR = 'Unable to sign in with those details. Please try again.';
const GENERIC_RECOVERY_NOTICE = 'If the account is eligible, password reset instructions will be sent.';

describe('VAPT #8 user-enumeration frontend behavior', () => {
  let toastr: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('submits doctor signup directly without an account-existence preflight', () => {
    const authService = jasmine.createSpyObj('AuthService', ['createDoc']);
    authService.createDoc.and.returnValue(of({}));
    const dialog = jasmine.createSpyObj('MatDialog', ['open']);
    const component = new DsignupComponent(dialog, authService, { nativeElement: {} } as any);
    const form: any = {
      invalid: false,
      value: {
        fname: 'Alex',
        lname: 'Doctor',
        email: 'alex@example.com',
        dob: '1980-01-01',
        password: 'StrongPass1!',
        password2: 'StrongPass1!',
        phone: '1234567890',
        edu_details: 'MBBS graduate',
        adhaar: '',
        religion: 'na',
        doc_type: 'cardiologist',
        yrs_exp: '5',
        reg_no: 'DOC123',
        m_status: 'na',
      },
    };

    component.onSignup(form);

    expect(authService.createDoc).toHaveBeenCalled();
    expect((component as any).checkEmail).toBeUndefined();
    expect((component as any).emailExists).toBeUndefined();
  });

  it('uses one generic password-login failure for doctor, helper, and admin', () => {
    const http = {
      post: jasmine.createSpy('post').and.callFake(() =>
        throwError(() => ({ status: 401, error: { message: 'Account-specific backend text' } }))
      ),
    };
    const auth = new AuthService(http as any, router, toastr, { run: (callback) => callback() } as any);

    auth.loginDoc('user@example.com', 'password');
    auth.loginHelper('user@example.com', 'password', 'patient@example.com');
    auth.loginAdmin('user@example.com', 'password');

    expect(toastr.error.calls.count()).toBe(3);
    expect(toastr.error.calls.allArgs().map((args) => args[0])).toEqual([
      GENERIC_LOGIN_ERROR,
      GENERIC_LOGIN_ERROR,
      GENERIC_LOGIN_ERROR,
    ]);
  });

  it('shows the same generic message for unknown-user and wrong-password failures on patient-facing login', () => {
    const http = { post: jasmine.createSpy('post') };
    const authService = jasmine.createSpyObj('AuthService', ['establishPatientSession']);
    const component = new PloginComponent(http as any, toastr, router, authService);
    component.email = 'user@example.com';
    component.password = 'password';

    http.post.and.returnValue(throwError(() => ({ error: { message: 'Email not found' } })));
    component.onLogin();
    const unknownUserMessage = toastr.error.calls.mostRecent().args[0];

    http.post.and.returnValue(throwError(() => ({ error: { message: 'Wrong password' } })));
    component.onLogin();
    const wrongPasswordMessage = toastr.error.calls.mostRecent().args[0];

    expect(unknownUserMessage).toBe(GENERIC_LOGIN_ERROR);
    expect(wrongPasswordMessage).toBe(unknownUserMessage);
    expect(http.post.calls.allArgs().map((args: any[]) => args[0])).toEqual([
      jasmine.stringMatching(/\/patient\/login$/),
      jasmine.stringMatching(/\/patient\/login$/),
    ]);
  });

  it('registers a patient through the patient endpoint without helper fields', () => {
    const http = { post: jasmine.createSpy('post').and.returnValue(of({ message: 'created' })) };
    const component = new PsignupComponent(http as any, toastr, router);
    Object.assign(component, {
      fname: 'Pat', lname: 'Example', email: 'pat@example.com', password: 'Patient1!',
      confirmPassword: 'Patient1!', dob: '1990-01-01', mobileNo: '1234567890',
      secondaryMobile: '1234567891', gender: 'other', address: 'Home 123456',
    });

    component.onRegister({ invalid: false, form: { markAllAsTouched: jasmine.createSpy() } } as any);

    expect(http.post).toHaveBeenCalled();
    const [url, payload] = http.post.calls.mostRecent().args;
    expect(url).toMatch(/\/patient\/signup$/);
    expect(payload).toEqual(jasmine.objectContaining({
      email: 'pat@example.com', fname: 'Pat', lname: 'Example',
      mobile_no: '1234567890', mobile_secondary: '1234567891',
    }));
    expect(payload).not.toEqual(jasmine.objectContaining({ helper_id: jasmine.anything() }));
    expect(router.navigate).toHaveBeenCalledWith(['/plogin']);
  });

  it('logs in a patient with the patient endpoint and establishes the patient session', () => {
    const http = { post: jasmine.createSpy('post').and.returnValue(of({
      userId: 42, userEmail: 'pat@example.com', userName: 'Pat Example', expiresIn: 3600,
      token: 'response-token-is-not-stored',
    })) };
    const authService = jasmine.createSpyObj('AuthService', ['establishPatientSession']);
    const component = new PloginComponent(http as any, toastr, router, authService);
    component.email = 'pat@example.com';
    component.password = 'Patient1!';

    component.onLogin();

    expect(http.post).toHaveBeenCalledWith(jasmine.stringMatching(/\/patient\/login$/), {
      email: 'pat@example.com', password: 'Patient1!',
    });
    expect(authService.establishPatientSession).toHaveBeenCalledWith(42, 'pat@example.com', 'Pat Example', 3600);
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('loginType')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('userEmail')).toBeNull();
    expect(localStorage.getItem('userName')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/pdashboard']);
  });

  it('submits patient and doctor recovery requests and displays the same account-neutral notice', () => {
    const http = { post: jasmine.createSpy('post') };
    const patient = new ForgotpwdComponent(http as any, toastr);
    const doctor = new DforgotpwdComponent(http as any, toastr);
    const validForm: any = { invalid: false, form: { value: { email: 'person@example.com' } } };

    http.post.and.returnValues(
      of({ message: 'If the account is eligible, password reset instructions will be sent.' }),
      of({ message: 'If the account is eligible, password reset instructions will be sent.' })
    );
    patient.onSubmit(validForm);
    doctor.onSubmit(validForm);

    expect(http.post.calls.argsFor(0)).toEqual([
      jasmine.stringMatching(/\/patient\/forgetpwd$/),
      { email: 'person@example.com' },
    ]);
    expect(http.post.calls.argsFor(1)).toEqual([
      jasmine.stringMatching(/\/doctor\/forgetpwd$/),
      { email: 'person@example.com' },
    ]);
    expect(toastr.success.calls.allArgs().map((args) => args[0])).toEqual([
      GENERIC_RECOVERY_NOTICE,
      GENERIC_RECOVERY_NOTICE,
    ]);
  });

  it('does not render raw account details from failed recovery requests', () => {
    const http = {
      post: jasmine.createSpy('post').and.returnValue(
        throwError(() => ({ error: { message: 'No account row found in SQL' } }))
      ),
    };
    const patient = new ForgotpwdComponent(http as any, toastr);
    const doctor = new DforgotpwdComponent(http as any, toastr);
    const validForm: any = { invalid: false, form: { value: { email: 'person@example.com' } } };

    patient.onSubmit(validForm);
    doctor.onSubmit(validForm);

    expect(toastr.error.calls.allArgs().map((args) => args[0])).toEqual([
      'Unable to process that request right now. Please try again later.',
      'Unable to process that request right now. Please try again later.',
    ]);
  });

  it('uses the doctor reset endpoint and hides account-specific reset errors', () => {
    const http = { post: jasmine.createSpy('post') };
    const route = { paramMap: of(convertToParamMap({ docId: '17', token: 'reset-token' })) };
    const component = new DpwdresetComponent(http as any, toastr, route as any, router);
    component.ngOnInit();
    http.post.and.returnValue(of({ message: 'Doctor password updated successfully' }));

    const doctorResetForm: any = {
      invalid: false,
      form: { value: { password: 'StrongPass1!', password2: 'StrongPass1!' }, markAllAsTouched: jasmine.createSpy() },
      resetForm: jasmine.createSpy(),
    };
    component.onSave(doctorResetForm);

    expect(http.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/doctor\/forgetpwdresetpwd$/),
      { doc_id: '17', token: 'reset-token', password: 'StrongPass1!' }
    );
    expect(toastr.success).toHaveBeenCalledWith('Password updated successfully. You can now sign in.');
    expect(router.navigate).toHaveBeenCalledWith(['/dlogin']);

    toastr.error.calls.reset();
    http.post.and.returnValue(throwError(() => ({ error: { message: 'No doctor exists for id' } })));
    doctorResetForm.form.value = { password: 'NewPass2!', password2: 'NewPass2!' };
    component.onSave(doctorResetForm);
    expect(toastr.error).toHaveBeenCalledWith(
      'Unable to update the password. The reset link may be invalid or expired.'
    );
  });

  it('uses the patient reset contract, navigates to patient login, and hides invalid-link details', () => {
    const http = { post: jasmine.createSpy('post') };
    const route = { snapshot: { paramMap: { get: (name: string) => ({ patientId: '42', token: 'patient-reset-token' }[name]) } } };
    const component = new PwdresetComponent(new FormBuilder(), route as any, router, http as any, toastr);
    component.ngOnInit();
    component.form.setValue({ password: 'Patient1!', password2: 'Patient1!' });
    http.post.and.returnValue(of({ message: 'Password updated successfully.' }));

    component.onSave();

    expect(http.post).toHaveBeenCalledWith(jasmine.stringMatching(/\/patient\/forgetpwdresetpwd$/), {
      patient_id: '42', token: 'patient-reset-token', password: 'Patient1!',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/plogin']);

    http.post.and.returnValue(throwError(() => ({ error: { message: 'No patient found in SQL' } })));
    component.form.setValue({ password: 'Patient2!', password2: 'Patient2!' });
    component.onSave();
    expect(toastr.error).toHaveBeenCalledWith(
      'Unable to update the password. The reset link may be invalid or expired.', 'Error'
    );
  });
});

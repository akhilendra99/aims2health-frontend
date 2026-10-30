import { Subject } from 'rxjs';
import { DashboardComponent } from './dashboard.component';

describe('Dashboard OTP request controls', () => {
  let component: DashboardComponent;
  let postResponse: Subject<any>;
  let http: jasmine.SpyObj<any>;
  let toastr: jasmine.SpyObj<any>;

  beforeEach(() => {
    postResponse = new Subject<any>();
    http = jasmine.createSpyObj('HttpClient', ['post']);
    http.post.and.returnValue(postResponse);
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);

    component = Object.create(DashboardComponent.prototype);
    Object.assign(component as any, {
      http,
      toastr,
      cdr: { detectChanges: jasmine.createSpy('detectChanges') },
      patientData: { email_id: 'patient@example.com', mobile_no: '5551234567', countryCode: '+91' },
      isSendingOtp: false,
      isVerifyingPatientEmailOtp: false,
      isVerifyingPatientPhoneOtp: false,
      emailOtp: '1234',
      phoneOtp: '1234',
      emailOtpSent: false,
      emailVerified: false,
      emailVerificationToken: null,
    });
  });

  it('allows only one pending email send and displays a safe 429 message', () => {
    component.sendEmailOtpForPatient();
    component.sendEmailOtpForPatient();

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(component.isSendingOtp).toBeTrue();

    postResponse.error({ status: 429, headers: { get: () => null }, error: { message: 'internal detail' } });

    expect(component.isSendingOtp).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Too many attempts. Please wait before trying again.');
  });

  it('allows only one pending verification and accepts the backend success contract', () => {
    component.verifyEmailOtpForPatient();
    component.verifyEmailOtpForPatient();

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(component.isVerifyingPatientEmailOtp).toBeTrue();

    postResponse.next({ message: 'Email verified successfully', verificationToken: 'proof' });

    expect(component.isVerifyingPatientEmailOtp).toBeFalse();
    expect(component.emailVerified).toBeTrue();
    expect(component.emailOtp).toBe('');
    expect(component.emailVerificationToken).toBe('proof');
  });
});

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

  describe('OTP Backend Compatibility and Verification State Resets', () => {
    it('clears phone verification state when replacing Phone A with Phone B without changing input length', () => {
      component.patientData.mobile_no = '9876543210';
      component.patientData.countryCode = '+91';
      component.phoneVerified = true;
      component.phoneVerificationToken = 'phone-proof-123';
      component.phoneChallengeId = 'chal-123';
      component.verifiedPatientPhone = '9876543210';
      component.verifiedPatientCountryCode = '91';

      // Replace 10-digit Phone A with another 10-digit Phone B
      component.patientData.mobile_no = '9876543211';
      component.onPhoneChange();

      expect(component.phoneVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(component.phoneChallengeId).toBeNull();
      expect(component.verifiedPatientPhone).toBeNull();
    });

    it('clears phone verification state when country code changes', () => {
      component.patientData.mobile_no = '9876543210';
      component.patientData.countryCode = '+91';
      component.phoneVerified = true;
      component.phoneVerificationToken = 'phone-proof-123';
      component.phoneChallengeId = 'chal-123';
      component.verifiedPatientPhone = '9876543210';
      component.verifiedPatientCountryCode = '91';

      component.onCountryCodeChange('+1');

      expect(component.phoneVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(component.phoneChallengeId).toBeNull();
      expect(component.verifiedPatientCountryCode).toBeNull();
    });

    it('clears email verification state when email address changes', () => {
      component.patientData.email_id = 'user1@example.com';
      component.emailVerified = true;
      component.emailVerificationToken = 'email-proof-123';
      component.emailChallengeId = 'chal-456';
      component.verifiedPatientEmail = 'user1@example.com';

      component.patientData.email_id = 'user2@example.com';
      component.onEmailChange();

      expect(component.emailVerified).toBeFalse();
      expect(component.emailVerificationToken).toBeNull();
      expect(component.emailChallengeId).toBeNull();
      expect(component.verifiedPatientEmail).toBeNull();
    });

    it('sends patient-contact purpose and stores challengeId on sendPhoneOtpForPatient', () => {
      component.patientData.mobile_no = '9876543210';
      component.patientData.countryCode = '+91';
      component.isSendingOtp = false;

      component.sendPhoneOtpForPatient();

      expect(http.post.calls.mostRecent().args[1]).toEqual({
        phone: '9876543210',
        countryCode: '91',
        purpose: 'patient-contact',
      });

      postResponse.next({ vstatus: 'OTP sent successfully', challengeId: 'chal-phone-789' });

      expect(component.phoneOtpSent).toBeTrue();
      expect(component.phoneChallengeId).toBe('chal-phone-789');
    });

    it('prevents replay by rejecting phone OTP verification when response phone mismatches', () => {
      component.patientData.mobile_no = '9876543210';
      component.patientData.countryCode = '+91';
      component.phoneOtp = '123456';
      component.phoneChallengeId = 'chal-phone-789';

      component.verifyPhoneOtpForPatient();

      expect(http.post.calls.mostRecent().args[1]).toEqual({
        phone: '9876543210',
        countryCode: '91',
        otp: '123456',
        purpose: 'patient-contact',
        challengeId: 'chal-phone-789',
      });

      // Attacker replays Phone A response for Phone B
      postResponse.next({
        vstatus: 'approved',
        verificationToken: 'stolen-token',
        phone: '1111111111',
        countryCode: '91',
      });

      expect(component.phoneVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('The code is invalid or expired. Request a new code and try again.');
    });

    it('prevents replay by rejecting phone OTP verification when response country code mismatches', () => {
      component.patientData.mobile_no = '9876543210';
      component.patientData.countryCode = '+91';
      component.phoneOtp = '123456';
      component.phoneChallengeId = 'chal-phone-789';

      component.verifyPhoneOtpForPatient();

      postResponse.next({
        vstatus: 'approved',
        verificationToken: 'token',
        phone: '9876543210',
        countryCode: '1',
      });

      expect(component.phoneVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('The code is invalid or expired. Request a new code and try again.');
    });

    it('successfully verifies phone OTP with legitimate backend response and stores verificationToken', () => {
      component.patientData.mobile_no = '9876543210';
      component.patientData.countryCode = '+91';
      component.phoneOtp = '123456';
      component.phoneChallengeId = 'chal-phone-789';

      component.verifyPhoneOtpForPatient();

      postResponse.next({
        vstatus: 'approved',
        verificationToken: 'legit-token',
        phone: '9876543210',
        countryCode: '91',
      });

      expect(component.phoneVerified).toBeTrue();
      expect(component.phoneVerificationToken).toBe('legit-token');
      expect(component.verifiedPatientPhone).toBe('9876543210');
      expect(component.verifiedPatientCountryCode).toBe('91');
    });

    it('prevents replay by rejecting email OTP verification when response email mismatches', () => {
      component.patientData.email_id = 'patient@example.com';
      component.emailOtp = '123456';

      component.verifyEmailOtpForPatient();

      postResponse.next({
        message: 'Email verified successfully',
        verificationToken: 'token',
        email: 'attacker@example.com',
      });

      expect(component.emailVerified).toBeFalse();
      expect(component.emailVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('The code is invalid or expired. Request a new code and try again.');
    });
  });
});

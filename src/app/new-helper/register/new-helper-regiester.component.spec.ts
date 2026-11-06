import { Observable, Subject, of } from 'rxjs';
import { NewHelperRegisterComponent } from './new-helper-regiester.component';

describe('NewHelperRegisterComponent OTP verification', () => {
  let component: NewHelperRegisterComponent;
  let postResponse: Observable<any>;
  let toastr: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<any>;

  beforeEach(() => {
    postResponse = of({ message: 'Email verified successfully', verificationToken: 'a'.repeat(48) });
    const http = {
      post: jasmine.createSpy('post').and.callFake(() => postResponse),
    };
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    component = new NewHelperRegisterComponent(
      http as any,
      toastr,
      router as any
    );
    component.identifier = 'person@example.com';
    component.detectedType = 'email';
    component.otp = '1234';
  });

  afterEach(() => component.ngOnDestroy());

  it('uses neutral conditional-delivery messaging for the generic OTP-send response', () => {
    postResponse = of({
      vstatus: 'OTP sent successfully',
      message: 'If eligible, an OTP has been sent to the provided email.',
    });

    component.sendOTP();

    expect(component.showOTPInput).toBeTrue();
    expect(toastr.info).toHaveBeenCalledWith(
      'If this contact is eligible, you may receive a verification code. If you already have an account, sign in instead.'
    );
    expect(toastr.success).not.toHaveBeenCalledWith(jasmine.stringMatching(/OTP sent to/));
  });

  it('accepts the existing exact successful email response for the current identifier', () => {
    component.verifyOTP();

    expect(component.isVerified).toBeTrue();
    expect(component.emailVerificationToken).toBe('a'.repeat(48));
    expect(component.showOTPInput).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('rejects an invalid OTP response even if it contains a proof', () => {
    postResponse = of({ message: 'Invalid or expired OTP', verificationToken: 'a'.repeat(48) });
    component.verifyOTP();
    expect(component.isVerified).toBeFalse();
    expect(component.emailVerificationToken).toBeNull();
  });

  it('rejects a wrong verification response even when it contains a proof', () => {
    postResponse = of({ message: 'Not verified successfully', verificationToken: 'a'.repeat(48) });
    component.verifyOTP();
    expect(component.isVerified).toBeFalse();
    expect(component.emailVerificationToken).toBeNull();
  });

  it('rejects a successful email response that omits verificationToken', () => {
    postResponse = of({ message: 'Email verified successfully' });
    expect(() => component.verifyOTP()).not.toThrow();
    expect(component.isVerified).toBeFalse();
  });

  it('rejects a malformed verificationToken', () => {
    postResponse = of({ message: 'Email verified successfully', verificationToken: 'not-a-proof' });
    component.verifyOTP();
    expect(component.isVerified).toBeFalse();
    expect(component.emailVerificationToken).toBeNull();
  });

  it('does not apply a successful response to an identifier changed while verification is pending', () => {
    const pendingResponse = new Subject<any>();
    postResponse = pendingResponse.asObservable();

    component.verifyOTP();
    component.identifier = 'other@example.com';
    component.onIdentifierInput();
    component.identifier = 'person@example.com';
    component.onIdentifierInput();
    pendingResponse.next({ message: 'Email verified successfully', verificationToken: 'a'.repeat(48) });

    expect(component.isVerified).toBeFalse();
    expect(component.emailVerificationToken).toBeNull();
  });

  it('ignores stale success and error callbacks after a newer verification starts', () => {
    const oldResponse = new Subject<any>();
    const currentResponse = new Subject<any>();
    const http = (component as any).http;
    http.post.and.returnValues(oldResponse.asObservable(), currentResponse.asObservable());

    component.verifyOTP();
    component.identifier = 'new@example.com';
    component.onIdentifierInput();
    component.otp = '5678';
    component.verifyOTP();

    oldResponse.next({ message: 'Email verified successfully', verificationToken: 'a'.repeat(48) });
    expect(component.isVerifyingOTP).toBeTrue();
    expect(component.emailVerificationToken).toBeNull();

    currentResponse.next({ message: 'Email verified successfully', verificationToken: 'b'.repeat(48) });
    expect(component.isVerified).toBeTrue();
    expect(component.emailVerificationToken).toBe('b'.repeat(48));

    oldResponse.error({ status: 400 });
    expect(component.isVerified).toBeTrue();
    expect(component.emailVerificationToken).toBe('b'.repeat(48));
  });

  it('ignores stale send callbacks without resetting a newer send state', () => {
    const oldResponse = new Subject<any>();
    const currentResponse = new Subject<any>();
    const http = (component as any).http;
    http.post.and.returnValues(oldResponse.asObservable(), currentResponse.asObservable());

    component.sendOTP();
    component.editIdentifier();
    component.identifier = 'new@example.com';
    component.onIdentifierInput();
    component.sendOTP();

    oldResponse.next({ vstatus: 'OTP sent successfully' });
    expect(component.isSendingOTP).toBeTrue();
    expect(component.showOTPInput).toBeFalse();
    oldResponse.error({ status: 400 });
    expect(component.isSendingOTP).toBeTrue();

    currentResponse.next({ vstatus: 'OTP sent successfully' });
    expect(component.isSendingOTP).toBeFalse();
    expect(component.showOTPInput).toBeTrue();
  });

  it('uses the existing approved response shape for phone verification', () => {
    component.detectedType = 'phone';
    component.identifier = '1234567890';
    postResponse = of({ vstatus: 'approved', verificationToken: 'b'.repeat(48) });

    component.verifyOTP();

    expect(component.isVerified).toBeTrue();
    expect(component.phoneVerificationToken).toBe('b'.repeat(48));
  });

  it('does not bind a pending phone proof if its country code changes', () => {
    const pendingResponse = new Subject<any>();
    postResponse = pendingResponse.asObservable();
    component.detectedType = 'phone';
    component.identifier = '1234567890';
    component.countryCode = '+91';

    component.verifyOTP();
    const http = (component as any).http;
    expect(http.post.calls.mostRecent().args[1]).toEqual({
      phone: '1234567890', countryCode: '91', otp: '1234', purpose: 'helper-registration',
    });
    component.onCountryCodeChange('+1');
    pendingResponse.next({ vstatus: 'approved', verificationToken: 'b'.repeat(48) });

    expect(component.phoneVerificationToken).toBeNull();
    expect(component.isVerified).toBeFalse();
    expect(component.isFormValid()).toBeFalse();
  });

  it('submits only one send request while pending and gives a generic 429 message', () => {
    const pendingResponse = new Subject<any>();
    const http = (component as any).http;
    http.post.calls.reset();
    http.post.and.returnValue(pendingResponse);

    component.sendOTP();
    component.sendOTP();

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(component.isSendingOTP).toBeTrue();

    pendingResponse.error({ status: 429, headers: { get: () => null }, error: { message: 'internal detail' } });

    expect(component.isSendingOTP).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Too many attempts. Please wait before trying again.');
  });

  it('submits only one verification request while pending and recovers after throttling', () => {
    const pendingResponse = new Subject<any>();
    const http = (component as any).http;
    http.post.calls.reset();
    http.post.and.returnValue(pendingResponse);

    component.verifyOTP();
    component.verifyOTP();

    expect(http.post).toHaveBeenCalledTimes(1);
    expect(component.isVerifyingOTP).toBeTrue();

    pendingResponse.error({ status: 429, headers: { get: () => '45' } });

    expect(component.isVerifyingOTP).toBeFalse();
    expect(component.isVerified).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Too many attempts. Please wait 45 seconds before trying again.');
  });

  it('uses the shared password policy and submits the verified email proof', () => {
    component.identifier = 'person@example.com';
    component.detectedType = 'email';
    component.emailVerificationToken = 'c'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.isVerified = true;
    component.password = 'Abcdef1!';
    component.confirmPassword = 'Abcdef1!';
    component.updatePasswordStrength();
    expect(component.isFormValid()).toBeTrue();

    const http = (component as any).http;
    http.post.calls.reset();
    postResponse = of({ message: 'Helper registered successfully', helper_id: 29 });
    component.onRegister();

    expect(http.post.calls.mostRecent().args[0]).toMatch(/\/helper\/register$/);
    expect(http.post.calls.mostRecent().args[1]).toEqual({ password: 'Abcdef1!', email_id: 'person@example.com', emailVerificationToken: 'c'.repeat(48) });
    expect(component.password).toBe('');
    expect(component.confirmPassword).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['/helper-login']);
    expect(router.navigate).toHaveBeenCalledTimes(1);
  });

  it('submits the ten-digit phone and its phone proof, then navigates to login only after success', () => {
    component.identifier = '1234567890';
    component.detectedType = 'phone';
    component.countryCode = '+91';
    component.phoneVerificationToken = 'e'.repeat(48);
    (component as any).verifiedPhone = '1234567890';
    (component as any).verifiedCountryCode = '+91';
    component.password = 'Abcdef1!';
    component.confirmPassword = component.password;
    component.updatePasswordStrength();
    postResponse = of({ message: 'Helper registered successfully', helper_id: 30 });

    component.onRegister();

    const http = (component as any).http;
    expect(http.post.calls.mostRecent().args[1]).toEqual({
      password: 'Abcdef1!',
      phone_no: '1234567890',
      countryCode: '91',
      phoneVerificationToken: 'e'.repeat(48),
    });
    expect(router.navigate).toHaveBeenCalledWith(['/helper-login']);
  });

  it('ignores response tokens and cookies as session credentials after successful registration', () => {
    component.emailVerificationToken = 'f'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.password = 'Abcdef1!';
    component.confirmPassword = component.password;
    component.updatePasswordStrength();
    postResponse = of({
      message: 'Helper registered successfully', helper_id: 31,
      token: 'access-token-must-be-ignored', cookie: 'cookie-must-be-ignored',
    });
    component.onRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/helper-login']);
    expect(router.navigate).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('does not navigate after registration rejection or an invalid success response', () => {
    const http = (component as any).http;
    component.emailVerificationToken = 'f'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.password = 'Abcdef1!';
    component.confirmPassword = component.password;
    component.updatePasswordStrength();
    http.post.and.returnValue(of({ helper_id: 32 }));
    component.onRegister();
    expect(router.navigate).not.toHaveBeenCalled();

    http.post.and.returnValue(new Observable(subscriber => subscriber.error({ status: 400 })));
    component.onRegister();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalledWith(jasmine.stringMatching(/registration request was rejected/i));
  });

  it('sends helper-registration purpose and clears stale proofs on OTP resend', () => {
    component.emailVerificationToken = 'c'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.phoneVerificationToken = 'd'.repeat(48);
    (component as any).verifiedPhone = '1234567890';
    (component as any).verifiedCountryCode = '+91';
    component.isVerified = true;
    component.resendTimer = 0;
    component.resendOTP();
    expect((component as any).http.post.calls.mostRecent().args[1]).toEqual({
      email: 'person@example.com',
      purpose: 'helper-registration',
    });
    expect(component.emailVerificationToken).toBeNull();
    expect(component.phoneVerificationToken).toBeNull();
    expect((component as any).verifiedEmail).toBe('');
    expect((component as any).verifiedPhone).toBe('');
    expect((component as any).verifiedCountryCode).toBe('');
    expect(component.isVerified).toBeFalse();
  });

  it('clears proof when the contact is edited and requires proof before registration', () => {
    component.emailVerificationToken = 'c'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.identifier = 'other@example.com';
    component.onIdentifierInput();
    expect(component.emailVerificationToken).toBeNull();
    expect((component as any).verifiedEmail).toBe('');
    expect(component.isVerified).toBeFalse();

    component.password = 'Abcdef1!';
    component.confirmPassword = component.password;
    component.updatePasswordStrength();
    component.onRegister();
    expect((component as any).http.post).not.toHaveBeenCalled();
  });

  it('does not allow isVerified alone to authorize registration', () => {
    component.isVerified = true;
    component.password = 'Abcdef1!';
    component.confirmPassword = component.password;
    component.updatePasswordStrength();

    expect(component.isFormValid()).toBeFalse();
    component.onRegister();
    expect((component as any).http.post).not.toHaveBeenCalled();
  });

  it('clears phone proof on phone or country-code changes and includes purpose in phone verification', () => {
    component.detectedType = 'phone';
    component.identifier = '1234567890';
    component.otp = '1234';
    postResponse = of({ vstatus: 'approved', verificationToken: 'b'.repeat(48) });
    component.verifyOTP();
    expect((component as any).http.post.calls.mostRecent().args[1]).toEqual({ phone: '1234567890', countryCode: '91', otp: '1234', purpose: 'helper-registration' });
    component.onCountryCodeChange('+1');
    expect(component.phoneVerificationToken).toBeNull();
    expect((component as any).verifiedPhone).toBe('');
    expect((component as any).verifiedCountryCode).toBe('');
    expect(component.isVerified).toBeFalse();

    component.phoneVerificationToken = 'b'.repeat(48);
    (component as any).verifiedPhone = '1234567890';
    (component as any).verifiedCountryCode = '+91';
    component.identifier = '1234567891';
    component.onIdentifierInput();
    expect(component.phoneVerificationToken).toBeNull();
  });

  it('clears the previous contact proof when switching between email and phone', () => {
    component.emailVerificationToken = 'a'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.isVerified = true;
    component.identifier = '1234567890';
    component.onIdentifierInput();

    expect(component.emailVerificationToken).toBeNull();
    expect(component.phoneVerificationToken).toBeNull();
    expect((component as any).verifiedEmail).toBe('');
    expect((component as any).verifiedPhone).toBe('');
    expect((component as any).verifiedCountryCode).toBe('');
    expect(component.isVerified).toBeFalse();
    expect(component.detectedType).toBe('phone');

    component.phoneVerificationToken = 'b'.repeat(48);
    (component as any).verifiedPhone = '1234567890';
    (component as any).verifiedCountryCode = component.countryCode;
    component.isVerified = true;
    component.identifier = 'next@example.com';
    component.onIdentifierInput();

    expect(component.phoneVerificationToken).toBeNull();
    expect((component as any).verifiedPhone).toBe('');
    expect((component as any).verifiedCountryCode).toBe('');
    expect(component.isVerified).toBeFalse();
    expect(component.detectedType).toBe('email');
  });

  it('prevents duplicate registration submissions while a request is pending', () => {
    component.emailVerificationToken = 'c'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.password = 'Abcdef1!';
    component.confirmPassword = component.password;
    component.updatePasswordStrength();
    const pending = new Subject<any>();
    const http = (component as any).http;
    http.post.and.returnValue(pending);
    component.onRegister();
    component.onRegister();
    expect(http.post).toHaveBeenCalledTimes(1);
  });

  it('does not navigate or create a client session when duplicate registration is rejected', () => {
    component.emailVerificationToken = 'd'.repeat(48);
    (component as any).verifiedEmail = component.identifier;
    component.password = 'Abcdef1!';
    component.confirmPassword = component.password;
    component.updatePasswordStrength();
    const http = (component as any).http;
    http.post.and.returnValue(new Observable(subscriber => subscriber.error({
      status: 400, error: { message: 'Registration could not be completed with these details.' },
    })));

    component.onRegister();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('keeps the user at registration when missing, expired, or consumed proofs are rejected', () => {
    const http = (component as any).http;
    const rejectionMessages = [
      'Phone number must be verified with OTP before registration.',
      'Phone verification expired. Please verify again.',
      'Email verification expired. Please verify again.',
    ];

    rejectionMessages.forEach(message => {
      component.emailVerificationToken = 'a'.repeat(48);
      (component as any).verifiedEmail = component.identifier;
      component.password = 'Abcdef1!';
      component.confirmPassword = component.password;
      component.updatePasswordStrength();
      http.post.and.returnValue(new Observable(subscriber => subscriber.error({
        status: 400, error: { message },
      })));

      component.onRegister();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
    });
  });

  describe('OTP Backend Compatibility and Regression Scenarios', () => {
    it('successfully verifies phone OTP with challengeId, phone, countryCode, and verificationToken', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.otp = '1234';
      component.challengeId = 'chal-phone-123';

      const validToken = 'c'.repeat(48);
      postResponse = of({
        vstatus: 'approved',
        message: 'Phone verified successfully',
        verificationToken: validToken,
        challengeId: 'chal-phone-123',
        phone: '9876543210',
        countryCode: '91',
      });

      component.verifyOTP();

      const http = (component as any).http;
      expect(http.post.calls.mostRecent().args[1]).toEqual({
        phone: '9876543210',
        countryCode: '91',
        otp: '1234',
        purpose: 'helper-registration',
        challengeId: 'chal-phone-123',
      });
      expect(component.isVerified).toBeTrue();
      expect(component.phoneVerificationToken).toBe(validToken);
      expect((component as any).verifiedPhone).toBe('9876543210');
      expect((component as any).verifiedCountryCode).toBe('+91');
      expect(toastr.success).toHaveBeenCalledWith('phone verified!');
    });

    it('successfully verifies email OTP with challengeId and verificationToken', () => {
      component.identifier = 'test@example.com';
      component.detectedType = 'email';
      component.otp = '1234';
      component.challengeId = 'chal-email-456';

      const validToken = 'd'.repeat(48);
      postResponse = of({
        message: 'Email verified successfully',
        verificationToken: validToken,
        challengeId: 'chal-email-456',
        email: 'test@example.com',
      });

      component.verifyOTP();

      const http = (component as any).http;
      expect(http.post.calls.mostRecent().args[1]).toEqual({
        email: 'test@example.com',
        otp: '1234',
        purpose: 'helper-registration',
        challengeId: 'chal-email-456',
      });
      expect(component.isVerified).toBeTrue();
      expect(component.emailVerificationToken).toBe(validToken);
      expect((component as any).verifiedEmail).toBe('test@example.com');
      expect(toastr.success).toHaveBeenCalledWith('email verified!');
    });

    it('handles wrong OTP error gracefully without setting verification state', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.otp = '1234';

      const http = (component as any).http;
      http.post.and.returnValue(new Observable(subscriber => subscriber.error({
        status: 400,
        error: { message: 'Invalid OTP. Please try again.' },
      })));

      component.verifyOTP();

      expect(component.isVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('The code is invalid or expired. Request a new code and try again.');
    });

    it('handles expired OTP error gracefully without setting verification state', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.otp = '1234';

      const http = (component as any).http;
      http.post.and.returnValue(new Observable(subscriber => subscriber.error({
        status: 400,
        error: { message: 'OTP expired. Please request a new code.' },
      })));

      component.verifyOTP();

      expect(component.isVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('The code is invalid or expired. Request a new code and try again.');
    });

    it('clears verification state when changing phone number after successful verification', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.phoneVerificationToken = 'e'.repeat(48);
      (component as any).verifiedPhone = '9876543210';
      (component as any).verifiedCountryCode = '+91';
      component.challengeId = 'chal-123';
      component.isVerified = true;

      component.identifier = '9876543219';
      component.onIdentifierInput();

      expect(component.phoneVerificationToken).toBeNull();
      expect(component.challengeId).toBeNull();
      expect((component as any).verifiedPhone).toBe('');
      expect(component.isVerified).toBeFalse();
    });

    it('clears verification state when changing country code after successful verification', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.phoneVerificationToken = 'e'.repeat(48);
      (component as any).verifiedPhone = '9876543210';
      (component as any).verifiedCountryCode = '+91';
      component.challengeId = 'chal-123';
      component.isVerified = true;

      component.onCountryCodeChange('+1');

      expect(component.phoneVerificationToken).toBeNull();
      expect(component.challengeId).toBeNull();
      expect((component as any).verifiedCountryCode).toBe('');
      expect(component.isVerified).toBeFalse();
    });

    it('clears verification state when replacing Phone A with Phone B without changing input length', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.phoneVerificationToken = 'e'.repeat(48);
      (component as any).verifiedPhone = '9876543210';
      (component as any).verifiedCountryCode = '+91';
      component.challengeId = 'chal-123';
      component.isVerified = true;

      component.identifier = '8765432109';
      component.onIdentifierInput();

      expect(component.phoneVerificationToken).toBeNull();
      expect(component.challengeId).toBeNull();
      expect((component as any).verifiedPhone).toBe('');
      expect(component.isVerified).toBeFalse();
    });

    it('prevents frontend replay by rejecting verification response containing Phone A details during Phone B flow', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.otp = '1234';

      postResponse = of({
        vstatus: 'approved',
        verificationToken: 'f'.repeat(48),
        phone: '1111111111',
        countryCode: '91',
      });

      component.verifyOTP();

      expect(component.isVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('Unable to verify that code. Check it and try again.');
    });

    it('prevents frontend replay by rejecting verification response with countryCode mismatch', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      component.otp = '1234';

      postResponse = of({
        vstatus: 'approved',
        verificationToken: 'f'.repeat(48),
        phone: '9876543210',
        countryCode: '1',
      });

      component.verifyOTP();

      expect(component.isVerified).toBeFalse();
      expect(component.phoneVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('Unable to verify that code. Check it and try again.');
    });

    it('prevents frontend replay by rejecting verification response with email mismatch', () => {
      component.identifier = 'legit@example.com';
      component.detectedType = 'email';
      component.otp = '1234';

      postResponse = of({
        message: 'Email verified successfully',
        verificationToken: 'f'.repeat(48),
        email: 'attacker@example.com',
      });

      component.verifyOTP();

      expect(component.isVerified).toBeFalse();
      expect(component.emailVerificationToken).toBeNull();
      expect(toastr.error).toHaveBeenCalledWith('Unable to verify that code. Check it and try again.');
    });

    it('submits countryCode, phone, and verificationToken on legitimate registration after verification', () => {
      component.identifier = '9876543210';
      component.detectedType = 'phone';
      component.countryCode = '+91';
      const validToken = 'f'.repeat(48);
      component.phoneVerificationToken = validToken;
      (component as any).verifiedPhone = '9876543210';
      (component as any).verifiedCountryCode = '+91';
      component.password = 'Abcdef1!';
      component.confirmPassword = 'Abcdef1!';
      component.updatePasswordStrength();

      postResponse = of({ message: 'Helper registered successfully', helper_id: 99 });

      component.onRegister();

      const http = (component as any).http;
      expect(http.post.calls.mostRecent().args[1]).toEqual({
        password: 'Abcdef1!',
        phone_no: '9876543210',
        countryCode: '91',
        phoneVerificationToken: validToken,
      });
      expect(router.navigate).toHaveBeenCalledWith(['/helper-login']);
    });
  });
});

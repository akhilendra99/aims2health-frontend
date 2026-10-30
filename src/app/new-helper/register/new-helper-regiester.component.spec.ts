import { Observable, Subject, of } from 'rxjs';
import { NewHelperRegisterComponent } from './new-helper-regiester.component';

describe('NewHelperRegisterComponent OTP verification', () => {
  let component: NewHelperRegisterComponent;
  let postResponse: Observable<any>;
  let toastr: jasmine.SpyObj<any>;
  let router: jasmine.SpyObj<any>;

  beforeEach(() => {
    postResponse = of({ message: 'Email verified successfully' });
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
    expect(component.showOTPInput).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('rejects invalid, unexpected, and malformed success responses', () => {
    postResponse = of({ message: 'OTP invalid' });
    component.verifyOTP();
    expect(component.isVerified).toBeFalse();

    postResponse = of({ message: 'Not verified successfully' });
    component.verifyOTP();
    expect(component.isVerified).toBeFalse();

    postResponse = of(null);
    expect(() => component.verifyOTP()).not.toThrow();
    expect(component.isVerified).toBeFalse();
  });

  it('does not apply a successful response to an identifier changed while verification is pending', () => {
    const pendingResponse = new Subject<any>();
    postResponse = pendingResponse.asObservable();

    component.verifyOTP();
    component.editIdentifier();
    component.identifier = 'other@example.com';
    component.detectedType = 'email';
    pendingResponse.next({ message: 'Email verified successfully' });

    expect(component.isVerified).toBeFalse();
  });

  it('uses the existing approved response shape for phone verification', () => {
    component.detectedType = 'phone';
    component.identifier = '1234567890';
    postResponse = of({ vstatus: 'approved' });

    component.verifyOTP();

    expect(component.isVerified).toBeTrue();
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

  it('uses the shared password policy for helper registration without changing the submitted value', () => {
    component.identifier = 'person@example.com';
    component.detectedType = 'email';
    component.isVerified = true;
    component.password = 'Abcdef1!';
    component.confirmPassword = 'Abcdef1!';
    component.updatePasswordStrength();
    expect(component.isFormValid()).toBeTrue();

    const http = (component as any).http;
    http.post.calls.reset();
    postResponse = of({ helper_id: 29 });
    component.onRegister();

    expect(http.post.calls.mostRecent().args[0]).toMatch(/\/helper\/register$/);
    expect(http.post.calls.mostRecent().args[1]).toEqual({ password: 'Abcdef1!', email_id: 'person@example.com' });
    expect(component.password).toBe('');
    expect(component.confirmPassword).toBe('');
  });
});

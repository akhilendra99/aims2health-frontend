import { Subject } from 'rxjs';
import { PaccountverifyComponent } from './paccountverify.component';

describe('PaccountverifyComponent OTP request controls', () => {
  let component: PaccountverifyComponent;
  let pending: Subject<any>;
  let service: jasmine.SpyObj<any>;
  let toastr: jasmine.SpyObj<any>;

  beforeEach(() => {
    pending = new Subject<any>();
    service = jasmine.createSpyObj('PaccountService', ['sendPhoneOTP', 'sendEmailOTP', 'verifyPhone', 'verifyEmail']);
    service.sendPhoneOTP.and.returnValue(pending);
    service.sendEmailOTP.and.returnValue(pending);
    service.verifyPhone.and.returnValue(pending);
    service.verifyEmail.and.returnValue(pending);
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);
    component = new PaccountverifyComponent(service, {} as any, toastr);
    component.userPhone = 5551234567;
    component.userEmail = 'patient@example.com';
    component.userCountryCode = 91;
  });

  it('prevents duplicate pending send requests and handles 429 generically', () => {
    component.sendEmaileOTP();
    component.sendEmaileOTP();

    expect(service.sendEmailOTP).toHaveBeenCalledTimes(1);
    expect(component.isSendingEmailOtp).toBeTrue();

    pending.error({ status: 429, headers: { get: () => null }, error: { message: 'account exists' } });

    expect(component.isSendingEmailOtp).toBeFalse();
    expect(toastr.error).toHaveBeenCalledWith('Too many attempts. Please wait before trying again.');
  });

  it('prevents duplicate verification and clears the code only after backend approval', () => {
    const form = { invalid: false, value: { phoneOTP: '1234' }, resetForm: jasmine.createSpy('resetForm') } as any;
    component.phoneVerify(form);
    component.phoneVerify(form);

    expect(service.verifyPhone).toHaveBeenCalledTimes(1);
    expect(component.isVerifyingPhoneOtp).toBeTrue();

    pending.next({ vstatus: 'approved' });

    expect(component.isVerifyingPhoneOtp).toBeFalse();
    expect(component.phoneV).toBe(1);
    expect(form.resetForm).toHaveBeenCalled();
  });
});

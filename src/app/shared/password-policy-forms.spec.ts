import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { PsignupComponent } from '../patient/pauth/psignup/psignup.component';
import { PchangpwdComponent } from '../patient/pchangpwd/pchangpwd.component';
import { PChangePWDService } from '../patient/pchangpwd/pchangpwd.service';
import { DchangpwdComponent } from '../doctor/dchangpwd/dchangpwd.component';
import { DChangePWDService } from '../doctor/dchangpwd/dchangpwd.service';
import { PwdresetComponent } from '../patient/forgotpwd/pwdreset/pwdreset.component';

describe('password policy form integration', () => {
  const toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
  const router = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(() => {
    toastr.success.calls.reset();
    toastr.error.calls.reset();
    toastr.warning.calls.reset();
    router.navigate.calls.reset();
  });

  it('blocks patient signup when the shared password policy is not met', () => {
    const http = { post: jasmine.createSpy('post') };
    const component = new PsignupComponent(http as any, toastr, router);
    component.password = 'Password1!';
    component.confirmPassword = 'Password1!';

    component.onRegister({ invalid: false, form: { markAllAsTouched: jasmine.createSpy() } } as any);

    expect(http.post).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalled();
  });

  it('blocks password reset submission for a weak password', () => {
    const http = { post: jasmine.createSpy('post') };
    const route = { snapshot: { paramMap: { get: (name: string) => ({ patientId: '5', token: 'reset-token' }[name]) } } };
    const component = new PwdresetComponent(new FormBuilder(), route as any, router, http as any, toastr);
    component.ngOnInit();
    component.form.setValue({ password: 'weak1!', password2: 'weak1!' });

    component.onSave();

    expect(http.post).not.toHaveBeenCalled();
    expect(component.form.invalid).toBeTrue();
  });

  it('blocks patient and doctor change-password requests with weak new passwords', () => {
    const patientUpdate = jasmine.createSpy('patientUpdate').and.returnValue(of({}));
    const doctorUpdate = jasmine.createSpy('doctorUpdate').and.returnValue(of({}));
    const patient = new PchangpwdComponent({ updatePwd: patientUpdate } as any, toastr);
    const doctor = new DchangpwdComponent({ updatePwd: doctorUpdate } as any, toastr);
    const invalidForm = {
      invalid: false,
      form: {
        value: { oldPassword: 'Current1!', password: 'weak1!', password2: 'weak1!' },
        markAllAsTouched: jasmine.createSpy(),
      },
    } as any;

    patient.onSave(invalidForm);
    doctor.onSave(invalidForm);

    expect(patientUpdate).not.toHaveBeenCalled();
    expect(doctorUpdate).not.toHaveBeenCalled();
  });

  it('preserves the patient and doctor change-password endpoint payload contracts', () => {
    const http = { put: jasmine.createSpy('put').and.returnValue(of({})) };
    const patientService = new PChangePWDService(http as any, router, toastr);
    const doctorService = new DChangePWDService(http as any, router, toastr);

    patientService.updatePwd('Current1!', 'StrongPass1!').subscribe();
    doctorService.updatePwd('Current1!', 'StrongPass1!').subscribe();

    expect(http.put.calls.argsFor(0)).toEqual([
      jasmine.stringMatching(/\/patient\/chpwd$/),
      { oldpwd: 'Current1!', newpwd: 'StrongPass1!' },
    ]);
    expect(http.put.calls.argsFor(1)).toEqual([
      jasmine.stringMatching(/\/doctor\/chpwd$/),
      { oldpwd: 'Current1!', newpwd: 'StrongPass1!' },
    ]);
  });
});

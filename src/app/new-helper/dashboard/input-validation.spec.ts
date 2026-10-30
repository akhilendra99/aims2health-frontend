import { UntypedFormBuilder } from '@angular/forms';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';

describe('Helper Dashboard input validation and API payloads', () => {
  let component: DashboardComponent;
  let http: any;
  let toastr: jasmine.SpyObj<any>;

  const validPatient = () => ({
    fname: 'Asha',
    lname: 'Rao',
    email_id: '',
    dob: '2000-02-29',
    age: 26,
    gender: 'Other',
    countryCode: '+91',
    mobile_no: '9876543210',
    whatsapp_no: '',
    preferred_call: 'evening',
    preferred_sms: 'yes',
    sec_countryCode: '+91',
    mobile_secondary: '',
    address: '560001',
    abhaId: '',
    adhaar: '',
    medical_history: '<b>Known allergy</b>',
    password: '',
    ehr_id: '',
    id_type: '',
  });

  const validForm = () => ({
    valid: true,
    form: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') },
  } as any);

  beforeEach(() => {
    http = {
      post: jasmine.createSpy('post').and.returnValue(of({ message: 'ok' })),
      put: jasmine.createSpy('put').and.returnValue(of({ message: 'ok' })),
      get: jasmine.createSpy('get').and.returnValue(of({ message: 'ok' })),
    };
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    const authService = jasmine.createSpyObj('AuthService', ['getUserProfile', 'handleAuthenticationFailure', 'logout']);
    authService.getUserProfile.and.returnValue({ helper_id: 42 });
    component = new DashboardComponent(
      http,
      toastr,
      {} as NgZone,
      jasmine.createSpyObj('Router', ['navigate']) as unknown as Router,
      new UntypedFormBuilder(),
      { detectChanges: jasmine.createSpy('detectChanges') } as any,
      authService
    );
    component.todayIsoDate = '2026-10-25';
    component.patientData = validPatient();
    component.phoneVerified = true;
    component.emailVerified = false;
    component.whatsappVerified = false;
    localStorage.clear();
    spyOn(component, 'closePatientModal');
    spyOn(component, 'fetchPatients');
    spyOn(component, 'cancelEdit');
    spyOn(component, 'fetchRecords');
    spyOn(component, 'setActiveTab');
  });

  afterEach(() => localStorage.clear());

  it('blocks an invalid add-patient form before calling the API', () => {
    const form = validForm();
    form.valid = false;

    component.savePatient(form);

    expect(http.post).not.toHaveBeenCalled();
    expect(form.form.markAllAsTouched).toHaveBeenCalled();
  });

  it('submits a valid add-patient form without unsupported fields or stripping medical text', () => {
    component.savePatient(validForm());

    expect(http.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/helper\/add-patient$/),
      jasmine.any(Object),
      jasmine.any(Object)
    );
    const body = http.post.calls.mostRecent().args[1];
    expect(body.medical_history).toBe('<b>Known allergy</b>');
    expect(body).not.toEqual(jasmine.objectContaining({ age: jasmine.anything() }));
    expect(body).not.toEqual(jasmine.objectContaining({ preferred_call: jasmine.anything() }));
    expect(body).not.toEqual(jasmine.objectContaining({ preferred_sms: jasmine.anything() }));
    expect(body.helper_id).toBe(42);
  });

  it('rejects invalid calendar dates and medical history larger than the backend UTF-8 byte limit', () => {
    component.patientData.dob = '2001-02-30';
    component.savePatient(validForm());
    expect(http.post).not.toHaveBeenCalled();

    component.patientData.dob = '2000-02-29';
    component.patientData.medical_history = 'é'.repeat(32768);
    component.savePatient(validForm());
    expect(http.post).not.toHaveBeenCalled();
  });

  it('accepts the supported infant age zero and rejects ages above 120', () => {
    component.isAgeMode = true;
    component.patientData.age = 0;
    component.onAgeChange();
    component.savePatient(validForm());
    expect(http.post).toHaveBeenCalled();

    http.post.calls.reset();
    component.patientData.age = 121;
    component.onAgeChange();
    component.savePatient(validForm());
    expect(http.post).not.toHaveBeenCalled();
  });

  it('rejects invalid email, phone, PIN, and patient identifiers before API calls', () => {
    component.patientData.email_id = 'not-an-email';
    component.savePatient(validForm());
    expect(http.post).not.toHaveBeenCalled();

    component.patientData.email_id = '';
    component.patientData.mobile_no = '123';
    component.savePatient(validForm());
    expect(http.post).not.toHaveBeenCalled();

    component.patientData.mobile_no = '9876543210';
    component.patientData.address = '12AB56';
    component.savePatient(validForm());
    expect(http.post).not.toHaveBeenCalled();

    component.selectedPatient = { patient_id: '1e3' };
    component.isConsentAccepted = true;
    component.submitConsent();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('sends consent with only the backend-supported patient identifier', () => {
    component.selectedPatient = { patient_id: '13' };
    component.isConsentAccepted = true;

    component.submitConsent();

    expect(http.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/helper\/update-consent$/),
      { patient_id: '13' },
      jasmine.any(Object)
    );
  });

  it('rejects an impossible report date and omits client-controlled file metadata on update', () => {
    component.reportData = {
      report_id: '9', patient_id: '13', title: 'Visit', content: '<script>text</script>',
      mediaType: 'report', recordDate: '2025-02-30', file: null, image: '/images/current.pdf',
    };
    component.saveReport(validForm());
    expect(http.put).not.toHaveBeenCalled();

    component.reportData.recordDate = '2025-02-28';
    component.saveReport(validForm());
    expect(http.put).toHaveBeenCalled();
    const body = http.put.calls.mostRecent().args[1] as FormData;
    expect(body.get('content')).toBe('<script>text</script>');
    expect(body.has('imagePath')).toBeFalse();
    expect(body.has('mediaSize')).toBeFalse();

    http.post.calls.reset();
    component.reportData = {
      report_id: null, patient_id: '13', title: 'New report', content: 'Plain text',
      mediaType: 'report', recordDate: '2025-02-28', file: new File(['pdf'], 'report.pdf', { type: 'application/pdf' }), image: '',
    };
    component.saveReport(validForm());
    expect(http.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/helper\/medreport$/),
      jasmine.any(FormData),
      jasmine.any(Object)
    );
    const createBody = http.post.calls.mostRecent().args[1] as FormData;
    expect(createBody.has('image')).toBeTrue();
    expect(createBody.has('mediaType')).toBeTrue();
    expect(createBody.has('imagePath')).toBeFalse();
    expect(createBody.has('mediaSize')).toBeFalse();
  });

  it('rejects unsupported and oversized report uploads', () => {
    const accepted = { size: 20, type: 'application/pdf', name: 'report.pdf' };
    component.onFileChange({ target: { files: [accepted], value: 'report.pdf' } } as any);
    expect(component.fileSizeError).toBeFalse();
    expect(component.reportData.file).toBe(accepted as any);

    const unsupported = { size: 20, type: 'image/svg+xml', name: 'payload.svg' };
    const event: any = { target: { files: [unsupported], value: 'payload.svg' } };
    component.onFileChange(event);
    expect(component.fileSizeError).toBeTrue();
    expect(component.reportData.file).toBeNull();

    const longFilename = { size: 20, type: 'application/pdf', name: 'x'.repeat(256) };
    event.target.files = [longFilename];
    component.onFileChange(event);
    expect(component.fileSizeError).toBeTrue();
    expect(component.reportData.file).toBeNull();

    const oversized = { size: 25 * 1024 * 1024 + 1, type: 'application/pdf', name: 'large.pdf' };
    event.target.files = [oversized];
    component.onFileChange(event);
    expect(component.fileSizeError).toBeTrue();
    expect(component.reportData.file).toBeNull();
  });

  it('matches helper password-change rules and enforces the password byte limit', () => {
    component.pwdForm.setValue({
      oldPassword: 'current',
      newPassword: 'Abcd123!',
      confirmPassword: 'Abcd123!',
    });
    expect(component.pwdForm.valid).toBeTrue();

    component.pwdForm.patchValue({ newPassword: 'Abcd1234', confirmPassword: 'Abcd1234' });
    expect(component.pwdForm.invalid).toBeTrue();

    component.pwdForm.patchValue({
      newPassword: 'Abcd1234567890123!',
      confirmPassword: 'Abcd1234567890123!',
    });
    expect(component.pwdForm.invalid).toBeTrue();
  });

  it('rejects a malformed appointment-search date and submits a valid ISO date/type', () => {
    component.appointmentData = { date: '2026-02-30', appointmentType: 'Cardiology' };
    component.submitAppointment(validForm());
    expect(http.post).not.toHaveBeenCalled();

    component.appointmentData = { date: '2026-02-28', appointmentType: 'Cardiology' };
    component.submitAppointment(validForm());
    expect(http.post).toHaveBeenCalledWith(
      jasmine.stringMatching(/\/helper\/search$/),
      { appmntDate: '2026-02-28', docType: 'Cardiology' },
      jasmine.any(Object)
    );
  });
});

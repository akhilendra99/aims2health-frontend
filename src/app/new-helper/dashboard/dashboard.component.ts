import {
  Component,
  OnInit,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormBuilder, // <-- NEW
  UntypedFormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { NgForm } from '@angular/forms';
import { jsPDF } from 'jspdf';
var moment = require('moment');

declare var Razorpay: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DashboardComponent implements OnInit {
  @ViewChild('recordForm') recordForm!: NgForm;
  @ViewChild('scheduleForm') scheduleForm!: NgForm;
  maxDobDate: string;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private ngZone: NgZone,
    private router: Router,
    private fb: UntypedFormBuilder, // <-- NEW
    private cdr: ChangeDetectorRef
  ) {
    this.initPwdForm();
  }
  isSavingPatient = false;
  isSendingOtp = false;
  resendCountdown = 0;
  private resendInterval: any;
  isPrescriptionModalOpen = false;
  isHelplineModalOpen = false;
  isLoadingPrescription = false;
  isChangeWhatsAppModalOpen = false;
  prescriptions: any[] = [];
  currentCalendarId: number | null = null;
  patients: any[] = [];
  selectedPatient: any = null;
  activeTab: string = 'details';
  pwdForm!: UntypedFormGroup;
  isSelfPatient = false;
  whatsappOtp: string = '';
  whatsappOtpSent: boolean = false;
  whatsappVerified: boolean = false;
  isSendingWhatsAppOtp: boolean = false;
  whatsappResendCountdown: number = 0;
  private whatsappResendInterval: any;
  isPatientModalOpen = false;
  isProfileMenuOpen = false;
  helperData: any = null;
  isConsentAccepted = false;
  isAgeMode = false;
  calculatedDob = '';
  emailOtpSent = false;
  isSelfPatientAdded = false;
  phoneOtpSent = false;
  todayIsoDate: string = '';
  emailVerified = false;
  // Modal password fields
  modalPassword = '';
  modalConfirmPassword = '';
  // Error flag for UI
  fileSizeError = false;
  // Password strength
  hasCapitalLetter = false;
  hasNumber = false;
  hasMinLength = false;
  phoneVerified = false;
  // Server-issued proof tokens from a fresh OTP verification — required by
  // /add-patient whenever the phone/email isn't already known (helper's own
  // contact, or an existing patient's under this helper). Cleared whenever
  // the underlying field changes so a stale token can't be replayed for a
  // different number.
  phoneVerificationToken: string | null = null;
  emailVerificationToken: string | null = null;
  whatsappVerificationToken: string | null = null;
  isChangeEmailModalOpen = false;
  isChangePhoneModalOpen = false;
  emailOtp: string = '';
  phoneOtp: string = '';
  recordTab: string = 'add';
  isDeleteModalOpen = false; // shows / hides the modal
  recordToDelete: any = null; // full record object (for title & date)
  isDeleting = false; // disables button while deleting
  isChangePwdModalOpen = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;
  restrictedTabs = [
    { id: 'records', name: 'Medical Record' },
    { id: 'schedule', name: 'Schedule Appointment' },
    { id: 'appointments', name: 'My Appointment' },
    { id: 'receipt', name: 'Booking Receipt' },
  ];

  patientData: any = {
    fname: '',
    lname: '',
    email_id: '',
    dob: '',
    gender: '',
    countryCode: '+91',
    mobile_no: '',
    whatsapp_no: '',
    preferred_call: '', // ← new
    preferred_sms: '',
    sec_countryCode: '+91',
    mobile_secondary: '',
    address: '',
    abhaId: '',
    adhaar: '',
    medical_history: '',
    password: '',
    ehr_id: '',
    id_type: '',
  };

  reportData: any = {
    report_id: null,
    patient_id: '',
    title: '',
    content: '',
    mediaType: '',
    recordDate: '',
    file: null,
    image: '', // for edit preview
  };

  medicalRecords: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  maxPosts: number = 0;
  totalPages: number = 1;

  appointments: any[] = [];
  appointmentsCurrentPage: number = 1;
  appointmentsPageSize: number = 20;
  appointmentsMaxPosts: number = 0;
  appointmentsTotalPages: number = 1;

  receipts: any[] = [];
  scheduleTab: string = 'schedule-form';
  appointmentData: any = { date: '', appointmentType: '' };
  doctorTypes: any[] = [];
  availableDoctorTypes: any[] = [];
  searchResults: any[] = [];

  razorPayOptions = {
    key: '',
    amount: '',
    currency: 'INR',
    name: 'AIMS2Health',
    description: 'Doctor Consultation Fees',
    order_id: '',
    handler: (response: any) => this.razorPayResponseHandler(response),
    notes: { address: 'AIMS2Health' },
    theme: { color: '#092f6eff' },
  };

  ngOnInit() {
    this.loadUserData();
    this.restoreActiveTab();
    this.fetchPatients();

    this.fetchDoctorTypes();
    const today = new Date();
    this.todayIsoDate = new Date().toISOString().split('T')[0];
    today.setMonth(today.getMonth() - 1);
    this.maxDobDate = today.toISOString().split('T')[0];
    // If consent not given → force open consent tab
    if (this.selectedPatient && !this.hasConsent()) {
      this.activeTab = 'consent';
    }
  }
  private loadUserData() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.helperData = JSON.parse(storedUser);
      } catch {
        this.helperData = storedUser;
      }
    }
  }

  get newPwdCtrl() {
    return this.pwdForm.get('newPassword')!;
  }
  get confirmCtrl() {
    return this.pwdForm.get('confirmPassword')!;
  }

  private restoreActiveTab() {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) this.activeTab = savedTab;
  }
  private getSafeMobile(value: any): string {
    if (!value) return '';
    const str = String(value).trim();
    if (str === '' || str === '0' || str === 'null' || str === 'undefined') {
      return '';
    }
    // Return only if it's a valid-looking 10-digit number
    return /^\d{10}$/.test(str) ? str : '';
  }
  // Open WhatsApp change confirmation modal
  openChangeWhatsAppModal() {
    this.isChangeWhatsAppModalOpen = true;
  }

  // Close modal
  closeChangeWhatsAppModal() {
    this.isChangeWhatsAppModalOpen = false;
  }

  // Called when user clicks "I Agree" in WhatsApp modal
  onWhatsAppAgree() {
    this.logout(); // same as email flow
    this.router.navigate(['/helper-register']);
  }

  // Optional: Direct trigger (if you want to keep old button style too)
  changeWhatsApp() {
    if (this.whatsappVerified) {
      this.openChangeWhatsAppModal(); // opens the nice modal instead of confirm()
    }
  }
  openPatientModal() {
    this.emailVerified = false;
    this.phoneVerified = false;
    this.whatsappVerified = false;
    this.emailVerificationToken = null;
    this.phoneVerificationToken = null;
    this.whatsappVerificationToken = null;
    this.emailOtpSent = false;
    this.phoneOtpSent = false;
    this.whatsappOtpSent = false;
    this.emailOtp = '';
    this.phoneOtp = '';
    this.whatsappOtp = '';

    const storedUser = localStorage.getItem('user');
    let defaultPassword = '';
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        defaultPassword = userData.password || '';
      } catch (e) {}
    }

    // Helper: Find first patient with valid mobile_no (not 0, not empty, not null)
    const firstPatientWithPhone = this.patients.find((p) => {
      const mobile = p.mobile_no;
      return (
        mobile &&
        mobile !== 0 &&
        String(mobile).trim() !== '' &&
        String(mobile).length >= 10
      );
    });

    // Find first patient with valid email (fallback)
    const firstPatientWithEmail = this.patients.find(
      (p) => p.email_id && String(p.email_id).trim() !== ''
    );

    // Use helper's data only if no patients exist
    const useHelperData = this.patients.length === 0;

    this.patientData = {
      fname: '',
      lname: '',
      email_id: useHelperData
        ? this.helperData?.email_id || ''
        : firstPatientWithEmail?.email_id || this.helperData?.email_id || '',

      dob: '',
      gender: '',
      countryCode: '+91',
      mobile_no: useHelperData
        ? this.getSafeMobile(this.helperData?.mobile)
        : this.getSafeMobile(firstPatientWithPhone?.mobile_no) || '',

      sec_countryCode: '+91',
      mobile_secondary: '',
      address: '',
      abhaId: '',
      adhaar: '',
      medical_history: '',
      password: defaultPassword,
      ehr_id: '',
      id_type: '',
    };

    // Set verification states based on pre-filled values
    this.emailVerified = !!this.patientData.email_id;
    this.phoneVerified =
      !!this.patientData.mobile_no && this.patientData.mobile_no.length === 10;

    this.isPatientModalOpen = true;
  }
  // Reset WhatsApp states when number changes
  onWhatsAppChange() {
    const whatsapp = this.patientData.whatsapp_no || '';
    if (whatsapp.length !== 10) {
      this.whatsappVerified = false;
      this.whatsappVerificationToken = null;
      this.whatsappOtpSent = false;
      this.whatsappOtp = '';
      this.whatsappResendCountdown = 0;
      this.clearWhatsAppCountdown();
    }
  }

  // Send WhatsApp OTP (same logic as phone OTP)
  sendWhatsAppOtpForPatient() {

    if (
      !this.patientData.whatsapp_no ||
      this.patientData.whatsapp_no.length !== 10
    ) {
      this.toastr.error('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    const currentWhatsAppNumber = String(this.patientData.whatsapp_no);
    this.isSendingWhatsAppOtp = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      phone: currentWhatsAppNumber,
      countryCode: '91',
    };

    this.http
      .post(`${environment.apiURL}/helper/sendPhoneVerifyOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          this.patientData.whatsapp_no = currentWhatsAppNumber; // restore

          if (res.vstatus === 'OTP sent successfully') {
            this.whatsappOtpSent = true;
            this.toastr.success('OTP sent to WhatsApp number.');
            this.startWhatsAppResendCountdown();
          } else {
            this.toastr.error(res.message || 'Failed to send WhatsApp OTP.');
          }
          this.isSendingWhatsAppOtp = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.patientData.whatsapp_no = currentWhatsAppNumber;
          this.isSendingWhatsAppOtp = false;
          this.handleApiError('Error sending WhatsApp OTP.', err);
          this.cdr.detectChanges();
        },
      });
  }

  // Verify WhatsApp OTP
  verifyWhatsAppOtpForPatient() {

    if (
      !this.patientData.whatsapp_no ||
      this.patientData.whatsapp_no.length !== 10
    ) {
      this.toastr.error('Invalid WhatsApp number.');
      return;
    }

    if (!this.whatsappOtp || this.whatsappOtp.length < 4) {
      this.toastr.error('Please enter the OTP.');
      return;
    }

    const currentWhatsAppNumber = String(this.patientData.whatsapp_no);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      phone: currentWhatsAppNumber,
      countryCode: '91',
      otp: this.whatsappOtp,
    };

    this.http
      .post(`${environment.apiURL}/helper/verifyPhoneOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          this.patientData.whatsapp_no = currentWhatsAppNumber;

          if (res.vstatus === 'approved') {
            this.whatsappVerified = true;
            this.whatsappVerificationToken = res.verificationToken || null;
            this.whatsappOtpSent = false;
            this.whatsappOtp = '';
            this.whatsappResendCountdown = 0;
            this.toastr.success('WhatsApp number verified successfully!');
          } else {
            this.toastr.error(res.message || 'Invalid OTP.');
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.patientData.whatsapp_no = currentWhatsAppNumber;
          this.handleApiError('Error verifying WhatsApp OTP.', err);
          this.cdr.detectChanges();
        },
      });
  }

  // Countdown timer for WhatsApp OTP resend
  private startWhatsAppResendCountdown() {
    this.whatsappResendCountdown = 30;

    if (this.whatsappResendInterval) {
      clearInterval(this.whatsappResendInterval);
    }

    this.whatsappResendInterval = setInterval(() => {
      this.whatsappResendCountdown--;
      if (this.whatsappResendCountdown <= 0) {
        clearInterval(this.whatsappResendInterval);
        this.whatsappResendInterval = null;
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private clearWhatsAppCountdown() {
    if (this.whatsappResendInterval) {
      clearInterval(this.whatsappResendInterval);
      this.whatsappResendInterval = null;
      this.whatsappResendCountdown = 0;
    }
  }

  // Allow only numbers in WhatsApp OTP input
  onWhatsAppOtpInput(event: any) {
    this.whatsappOtp = (event.target.value || '')
      .replace(/\D/g, '')
      .slice(0, 6);
  }

  // Open modal to change WhatsApp number (after verification)

  // Check if patient has given consent
  hasConsent(): boolean {
    return this.selectedPatient?.patient_consent === 1;
  }

  // Handle click on restricted tab
  onRestrictedTabClick(tabId: string) {
    if (!this.hasConsent()) {
      this.showConsentAlert();
      this.setActiveTab('consent'); // Force redirect to consent
    } else {
      this.setActiveTab(tabId);
    }
  }
  // Show alert (you can replace with toast/sweetalert later)
  showConsentAlert() {
    this.toastr.warning(
      `<strong style="font-size:16px">Patient Consent Required!</strong><br><br>
     You must read and accept the Patient Consent form before accessing other features like:<br><br>
     <ul style="margin:10px 0; padding-left:22px; text-align:left">
       <li>Medical Records</li>
       <li>Scheduling Appointments</li>
       <li>Viewing Appointments & Receipts</li>
     </ul>
     <em>Please scroll down on the <strong>'Patient Consent'</strong> tab and submit your consent.</em>`,
      'Consent Required',
      {
        enableHtml: true,
        timeOut: 15000,
        extendedTimeOut: 5000,
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-center',
        toastClass: 'ngx-toastr consent-toast',
      }
    );
  }

  closePatientModal() {
    this.isPatientModalOpen = false;
    this.resetOtpStates();
  }
  getPrescription(calendarId: number): void {
    if (!this.selectedPatient?.patient_id) {
      alert('Patient information not available');
      return;
    }

    this.currentCalendarId = calendarId;
    this.isPrescriptionModalOpen = true;
    this.isLoadingPrescription = true;
    this.prescriptions = [];

    const payload = {
      patientId: this.selectedPatient.patient_id,
      calendarId: calendarId,
    };

    this.http
      .post<any>(`${environment.apiURL}/patient/listprescriptions`, payload)
      .subscribe({
        next: (response) => {
          this.isLoadingPrescription = false;
          if (response.post && response.post.length > 0) {
            this.prescriptions = response.post;
          }
        },
        error: (error) => {
          this.isLoadingPrescription = false;
          console.error('Error fetching prescriptions:', error);
          alert('Failed to load prescriptions. Please try again.');
        },
      });
  }

  closePrescriptionModal(): void {
    this.isPrescriptionModalOpen = false;
    this.prescriptions = [];
    this.currentCalendarId = null;
  }

  openSelfPatientModal() {
    this.emailVerified = false;
    this.phoneVerified = false;
    this.whatsappVerified = false;
    this.emailVerificationToken = null;
    this.phoneVerificationToken = null;
    this.whatsappVerificationToken = null;
    this.emailOtpSent = false;
    this.phoneOtpSent = false;
    this.whatsappOtpSent = false;
    this.emailOtp = '';
    this.phoneOtp = '';
    this.whatsappOtp = '';
    this.isSelfPatient = true;
    const storedUser = localStorage.getItem('user');
    let defaultPassword = '';
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        defaultPassword = userData.password || '';
      } catch (e) {}
    }

    // Pre-fill with helper's data
    this.patientData = {
      fname: '',
      lname: '',
      email_id: this.helperData?.email_id || '',
      dob: '',
      gender: '',
      countryCode: '+91',
      mobile_no: this.getSafeMobile(this.helperData?.mobile),
      sec_countryCode: '+91',
      mobile_secondary: '',
      address: '',
      abhaId: '',
      adhaar: '',
      medical_history: '',
      password: defaultPassword,
      ehr_id: '',
      id_type: '',
    };

    // Set verification status based on what's available
    this.emailVerified = !!this.helperData?.email_id;
    this.phoneVerified = !!this.helperData?.mobile;
    this.emailOtpSent = false;
    this.phoneOtpSent = false;
    this.emailOtp = '';
    this.phoneOtp = '';
    this.isPatientModalOpen = true;
  }

  // File size limit (5 MB = 5 * 1024 * 1024 bytes)
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  sendPhoneOtpForPatient() {

    if (!this.patientData.mobile_no) {
      this.toastr.error('Please enter a phone number.');
      return;
    }

    // CRITICAL FIX 1: Store the phone number BEFORE any state changes
    const currentPhoneNumber = String(this.patientData.mobile_no);

    // CRITICAL FIX 2: Set sending flag BEFORE API call
    this.isSendingOtp = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      phone: currentPhoneNumber,
      countryCode: String(this.patientData.countryCode).replace('+', ''),
    };

    this.http
      .post(`${environment.apiURL}/helper/sendPhoneVerifyOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          // CRITICAL FIX 3: Restore phone number FIRST
          this.patientData.mobile_no = currentPhoneNumber;

          if (res.vstatus === 'OTP sent successfully') {
            // Set flags AFTER restoring phone number
            this.phoneOtpSent = true;
            this.toastr.success('OTP sent to phone number.');
            this.startResendCountdown();
          } else {
            this.toastr.error('Failed to send OTP. Please try again.');
            console.error('Send Phone OTP failed:', res);
          }

          // Reset sending flag
          this.isSendingOtp = false;

          // CRITICAL FIX 4: Force change detection
          this.cdr.detectChanges();
        },
        error: (err) => {
          // CRITICAL FIX 5: Restore phone number on error too
          this.patientData.mobile_no = currentPhoneNumber;
          this.isSendingOtp = false;
          this.handleApiError('Error sending Phone OTP.', err);
          this.cdr.detectChanges();
        },
      });
  }
  // Format Aadhaar as user types: 234567890123 → 2345 6789 0123
  formatAadhaar(event: any) {
    let value = event.target.value.replace(/\s/g, ''); // Remove spaces
    value = value.replace(/\D/g, ''); // Remove non-digits

    if (value.length > 12) {
      value = value.substring(0, 12);
    }

    // Add space after every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    this.patientData.adhaar = formatted;

    // Trigger change detection if needed
    this.cdr.detectChanges();
  }

  // Prevent invalid keys (only allow digits and navigation keys)
  restrictAadhaarInput(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'Home',
      'End',
      'ArrowLeft',
      'ArrowRight',
    ];

    if (allowedKeys.includes(event.key)) return;

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey || event.metaKey) return;

    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  }

  // Handle paste: clean and format
  onAadhaarPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '')
      .replace(/\D/g, '')
      .substring(0, 12);
    const formatted = pasted.match(/.{1,4}/g)?.join(' ') || pasted;
    this.patientData.adhaar = formatted;
    this.cdr.detectChanges();
  }

  // Check if Aadhaar is invalid (for showing error)
  isAadhaarInvalid(): boolean {
    const aadhaar = this.patientData.adhaar || '';
    const clean = aadhaar.replace(/\s/g, '');
    return (
      clean.length > 0 &&
      (clean.length !== 12 || clean[0] === '0' || clean[0] === '1')
    );
  }

  // Final validation function (can be used before submit)
  isValidAadhaar(): boolean {
    const aadhaar = (this.patientData.adhaar || '').replace(/\s/g, '');
    if (aadhaar.length !== 12) return false;
    if (!/^[2-9]/.test(aadhaar)) return false; // Doesn't start with 0 or 1
    return /^\d{12}$/.test(aadhaar);
  }
  openHelplineModal(): void {
    this.isHelplineModalOpen = true;
  }

  closeHelplineModal(): void {
    this.isHelplineModalOpen = false;
  }

  private initPwdForm() {
    this.pwdForm = this.fb.group(
      {
        oldPassword: [
          '',
          [Validators.required, this.nonWhitespaceValidator, this.passwordByteLimitValidator],
        ],
        newPassword: [
          '',
          [Validators.required, Validators.maxLength(16), this.passwordStrengthValidator],
        ],
        confirmPassword: [
          '',
          [Validators.required, Validators.maxLength(16), this.passwordByteLimitValidator],
        ],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /** 1. Strength validator – same rules as registration */
  private passwordStrengthValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const value: string = control.value || '';

    const hasDigit = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    const hasSupportedCharacters = /^[a-zA-Z0-9!@#$%^&*]*$/.test(value);

    const errors: ValidationErrors = {};

    if (!hasDigit) errors['missingDigit'] = true;
    if (!hasSpecial) errors['missingSpecialCharacter'] = true;
    if (!hasSupportedCharacters) errors['unsupportedCharacters'] = true;
    if (value.length < 8) errors['minlength'] = { requiredLength: 8 };
    if (this.utf8ByteLength(value) > 72) errors['maxUtf8Bytes'] = true;

    return Object.keys(errors).length ? errors : null;
  };

  private passwordByteLimitValidator = (
    control: AbstractControl
  ): ValidationErrors | null =>
    this.utf8ByteLength(control.value || '') > 72 ? { maxUtf8Bytes: true } : null;

  private nonWhitespaceValidator = (
    control: AbstractControl
  ): ValidationErrors | null =>
    typeof control.value === 'string' && control.value.trim().length > 0
      ? null
      : { whitespaceOnly: true };

  private utf8ByteLength(value: string): number {
    return new TextEncoder().encode(value || '').length;
  }

  private isIsoCalendarDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }

  private isPositiveSafeId(value: unknown): boolean {
    if (typeof value === 'string' && !/^[1-9]\d*$/.test(value)) return false;
    const id = typeof value === 'number' ? value : Number(value);
    return Number.isSafeInteger(id) && id > 0;
  }

  private isValidReportFile(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    return !!file && file.name.length > 0 && file.name.length <= 255 &&
      file.size >= 0 && file.size <= 25 * 1024 * 1024 && allowedTypes.includes(file.type);
  }
  toggleAgeDobMode() {
    this.isAgeMode = !this.isAgeMode;
    if (!this.isAgeMode) {
      this.patientData.age = null;
    } else {
      this.patientData.dob = null;
    }
  }

  onAgeChange() {
    if (this.patientData.age !== undefined && this.patientData.age !== null && this.patientData.age !== '') {
      const age = Number(this.patientData.age);
      if (Number.isInteger(age) && age >= 0 && age <= 120) {
        const today = new Date();
        const birthYear = today.getFullYear() - age;
        this.calculatedDob = `${birthYear}-01-01`; // Default Jan 1
        this.patientData.dob = this.calculatedDob; // Sync to dob for submission
      } else {
        this.calculatedDob = '';
        this.patientData.dob = null;
      }
    } else {
      this.calculatedDob = '';
      this.patientData.dob = null;
    }
  }
  // Reset phone states when number changes
  onPhoneChange() {
    const mobile = this.patientData.mobile_no || '';

    // Only reset states if the number is NOT exactly 10 digits
    // AND we're not in the middle of sending OTP
    if (mobile.length !== 10 && !this.isSendingOtp) {
      this.phoneVerified = false;
      this.phoneVerificationToken = null;
      this.phoneOtpSent = false;
      this.phoneOtp = '';
      this.resendCountdown = 0;
      if (this.resendInterval) {
        clearInterval(this.resendInterval);
        this.resendInterval = null;
      }
    }
    // If it's 10 digits → preserve verification status!
  }
  private passwordMatchValidator = (
    g: AbstractControl
  ): ValidationErrors | null => {
    const newPwd = g.get('newPassword')?.value;
    const confirm = g.get('confirmPassword')?.value;
    return newPwd && confirm && newPwd !== confirm
      ? { passwordMismatch: true }
      : null;
  };

  private checkSelfPatientExists() {
    if (!this.helperData || this.patients.length === 0) {
      this.isSelfPatientAdded = false;
      return;
    }

    const helperEmail = this.helperData.email_id?.toString().trim();
    const helperPhone = this.helperData.mobile?.toString().trim(); // ← Force string

    this.isSelfPatientAdded = this.patients.some((patient) => {
      const patientEmail = patient.email_id?.toString().trim();
      const patientPhone = patient.mobile_no?.toString().trim(); // ← Force string

      const emailMatch = helperEmail && patientEmail === helperEmail;
      const phoneMatch = helperPhone && patientPhone === helperPhone;

      return emailMatch || phoneMatch;
    });

    console.log('Self Patient Check Result:', {
      helperEmail,
      helperPhone,
      patientsPhones: this.patients.map((p) => p.mobile_no),
      isSelfPatientAdded: this.isSelfPatientAdded,
    });
  }
  verifyPhoneOtpForPatient() {

    if (
      !this.patientData.mobile_no ||
      this.patientData.mobile_no.length !== 10
    ) {
      this.toastr.error('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!this.phoneOtp || this.phoneOtp.length < 4) {
      this.toastr.error('Please enter the OTP.');
      return;
    }

    // Store phone number before verification
    const currentPhoneNumber = String(this.patientData.mobile_no);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      phone: currentPhoneNumber,
      countryCode: String(this.patientData.countryCode).replace('+', ''),
      otp: String(this.phoneOtp),
    };

    this.http
      .post(`${environment.apiURL}/helper/verifyPhoneOTP`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          // Restore phone number
          this.patientData.mobile_no = currentPhoneNumber;

          if (res.vstatus === 'approved') {
            this.phoneVerified = true;
            this.phoneVerificationToken = res.verificationToken || null;
            this.phoneOtp = ''; // Only clear OTP
            this.phoneOtpSent = false;
            this.resendCountdown = 0;
            this.toastr.success('Phone number verified successfully!');
          } else {
            this.toastr.error(res.message || 'Invalid OTP. Please try again.');
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          // Restore phone number on error
          this.patientData.mobile_no = currentPhoneNumber;
          this.handleApiError('Error verifying Phone OTP.', err);
          this.cdr.detectChanges();
        },
      });
  }

  sendEmailOtpForPatient() {

    if (!this.patientData.email_id) {
      this.toastr.error('Please enter an email address.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      email: this.patientData.email_id,
    };

    this.http
      .post(`${environment.apiURL}/helper/sendEmailVerifyOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.vstatus === 'OTP sent successfully') {
            this.emailOtpSent = true;
            this.toastr.success('OTP sent to email address.');
            this.startResendCountdown();
          } else {
            this.toastr.error('Failed to send OTP. Please try again.');
            console.error('Send Email OTP failed:', res);
            this.isSendingOtp = false;
          }
        },
        error: (err) => {
          this.isSendingOtp = false;
          this.handleApiError('Error sending Email OTP.', err);
        },
      });
  }
  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  onEmailChange() {
    if (
      !this.patientData.email_id ||
      !this.isValidEmail(this.patientData.email_id)
    ) {
      this.emailVerified = false;
      this.emailVerificationToken = null;
      this.emailOtpSent = false;
      this.emailOtp = '';
    }
  }
  // Triggered when user leaves email field
  onEmailBlur() {
    if (
      this.patientData.email_id &&
      this.isValidEmail(this.patientData.email_id)
    ) {
      this.emailOtpSent = false;
      this.emailVerified = false;
      this.emailVerificationToken = null;
      this.emailOtp = '';
    }
  }

  // Triggered when user leaves phone field
  onPhoneBlur() {
    if (
      this.patientData.mobile_no &&
      this.patientData.mobile_no.length === 10
    ) {
      this.phoneOtpSent = false;
      this.phoneVerified = false;
      this.phoneVerificationToken = null;
      this.phoneOtp = '';
    }
  }

  verifyEmailOtpForPatient() {

    if (!this.patientData.email_id) {
      this.toastr.error('Please enter an email address.');
      return;
    }

    if (!this.emailOtp) {
      this.toastr.error('Please enter the OTP.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      email: this.patientData.email_id,
      otp: this.emailOtp,
    };

    this.http
      .post(`${environment.apiURL}/helper/verifyEmailOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.message === 'Email verified successfully') {
            this.emailVerified = true;
            this.emailVerificationToken = res.verificationToken || null;
            this.emailOtpSent = false;
            this.emailOtp = '';
            this.toastr.success('Email address verified successfully!');
          } else {
            this.toastr.error(res.message || 'Invalid OTP. Please try again.');
            console.error('Verify Email OTP failed:', res);
          }
        },
        error: (err) => {
          this.handleApiError('Error verifying Email OTP.', err);
        },
      });
  }
  private startResendCountdown() {
    this.resendCountdown = 15;

    // Clear any existing timer
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }

    this.resendInterval = setInterval(() => {
      this.resendCountdown--;

      if (this.resendCountdown <= 0) {
        clearInterval(this.resendInterval);
        this.resendInterval = null;
      }

      // Important: Trigger change detection
      this.cdr.detectChanges();
    }, 1000);
  }
  savePatient(form: NgForm) {
    // Prevent if already saving
    if (this.isSavingPatient) {
      return;
    }

    const dobIsValid = this.isAgeMode
      ? this.patientData.age !== null && this.patientData.age !== undefined && this.patientData.age !== '' &&
        Number.isInteger(Number(this.patientData.age)) &&
        Number(this.patientData.age) >= 0 && Number(this.patientData.age) <= 120
      : this.isIsoCalendarDate(this.patientData.dob) &&
        this.patientData.dob <= this.todayIsoDate;
    const requiredTextIsValid =
      !!this.patientData.fname?.trim() && this.patientData.fname.length <= 50 &&
      !!this.patientData.lname?.trim() && this.patientData.lname.length <= 50 &&
      !!this.patientData.gender?.trim() && this.patientData.gender.length <= 20 &&
      /^\d{6}$/.test(String(this.patientData.address || '')) &&
      !!this.patientData.medical_history?.trim() &&
      this.utf8ByteLength(this.patientData.medical_history) <= 65535;
    const optionalFieldsAreValid =
      (!this.patientData.email_id ||
        (this.isValidEmail(this.patientData.email_id) && this.patientData.email_id.length <= 100)) &&
      /^\+?[\d\s().-]{10,30}$/.test(String(this.patientData.mobile_no || '')) &&
      (!this.patientData.mobile_secondary ||
        /^\+?[\d\s().-]{7,30}$/.test(String(this.patientData.mobile_secondary))) &&
      (!this.patientData.whatsapp_no || /^\d{10}$/.test(String(this.patientData.whatsapp_no))) &&
      (!this.patientData.countryCode || /^\+?\d{1,4}$/.test(String(this.patientData.countryCode))) &&
      (!this.patientData.sec_countryCode || /^\+?\d{1,4}$/.test(String(this.patientData.sec_countryCode))) &&
      String(this.patientData.abhaId || '').length <= 255 &&
      String(this.patientData.adhaar || '').length <= 30 &&
      String(this.patientData.ehr_id || '').length <= 30 &&
      String(this.patientData.id_type || '').length <= 30 &&
      this.utf8ByteLength(this.patientData.password || '') <= 72;

    if (!form?.valid || !dobIsValid || !requiredTextIsValid || !optionalFieldsAreValid) {
      form?.form.markAllAsTouched();
      this.toastr.error('Review required fields, dates, contact formats, and field length limits.');
      return;
    }

    if (
      this.isSelfPatient &&
      !this.patientData.email_id &&
      !this.patientData.mobile_no
    ) {
      this.toastr.error('Either Email or Phone Number is required.');
      return;
    }

    // The backend will reject this anyway (it requires a verification token
    // whenever it doesn't already recognize the number/email as the helper's
    // own or an existing patient's), but check client-side first for a clear
    // error instead of a round-trip failure. Phone is always required and
    // must be verified; email is optional but must be verified if provided.
    if (!this.patientData.mobile_no) {
      this.toastr.error('Phone number is required.');
      return;
    }
    if (!this.phoneVerified) {
      this.toastr.error('Please verify the phone number with OTP before saving.');
      return;
    }
    if (this.patientData.email_id && !this.emailVerified) {
      this.toastr.error('Please verify the email address with OTP before saving.');
      return;
    }
    if (this.patientData.whatsapp_no && !this.whatsappVerified) {
      this.toastr.error('Please verify the WhatsApp number with OTP before saving.');
      return;
    }

    // Start loading
    this.isSavingPatient = true;

    const helperData = JSON.parse(localStorage.getItem('user') || '{}');
    const {
      age: _age,
      preferred_call: _preferredCall,
      preferred_sms: _preferredSms,
      ...patientFields
    } = this.patientData;
    const payload = {
      ...patientFields,
      helper_id: helperData.helper_id,
      phoneVerificationToken: this.phoneVerificationToken,
      emailVerificationToken: this.emailVerificationToken,
      whatsappVerificationToken: this.whatsappVerificationToken,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http
      .post(`${environment.apiURL}/helper/add-patient`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Patient saved successfully:', res);
          this.toastr.success('Patient saved successfully!');
          this.closePatientModal();

          if (this.isSelfPatient) {
            localStorage.setItem('selfPatientAdded', 'true');
            this.isSelfPatientAdded = true;
            setTimeout(() => window.location.reload(), 1000);
          } else {
            this.fetchPatients();
          }
        },
        error: (err) => {
          this.handleApiError('Error saving patient.', err);
        },
        complete: () => {
          // Always stop loading, even on error
          this.isSavingPatient = false;
        },
      });
  }
  getFormattedDate(date: string): string {
    if (!date) return 'dd/mm/yyyy';
    return moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY');
  }
  private handleApiError(errorMessage: string, err: any) {
    console.error(errorMessage, err);
    const msg = err?.error?.message || err?.error?.vstatus || errorMessage;
    this.toastr.error(msg);

    if (err.status === 401 || err.status === 403) {
      localStorage.clear();
      this.toastr.warning('Session expired. Redirecting to login...');
      this.router.navigate(['/helper-login']);
    }
  }

  setActiveTab(tab: string) {
    if (
      this.restrictedTabs.map((t) => t.id).includes(tab) &&
      !this.hasConsent()
    ) {
      this.showConsentAlert();
      this.activeTab = 'consent';
    } else {
      this.activeTab = tab;

      // ← THIS IS THE KEY
      if (tab === 'receipt') {
        this.fetchReceipts(); // refresh every time user opens the tab
        this.cdr.detectChanges();
      }
    }

    localStorage.setItem('activeTab', tab);
    window.scrollTo(0, 0);
  }
  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    this.http
      .post(`${environment.apiURL}/helper/logout`, {})
      .subscribe({ error: () => {} }); // best-effort; client state is cleared regardless
    localStorage.removeItem('selectedPatientId');
    localStorage.removeItem('activeTab');
    localStorage.clear();
    this.toastr.success('Logged out successfully');
    this.router.navigate(['/helper-login']);
  }

  sendEmailOtp() {

    if (!this.selectedPatient?.email_id) {
      this.toastr.error('Selected patient has no email address.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      email: this.selectedPatient.email_id,
    };

    this.http
      .post(`${environment.apiURL}/helper/sendEmailVerifyOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.vstatus === 'OTP sent successfully') {
            this.emailOtpSent = true;
            this.toastr.success("OTP sent to patient's email.");
          } else {
            this.toastr.error('Failed to send OTP. Please try again.');
            console.error('Send Email OTP failed:', res);
          }
        },
        error: (err) => {
          this.handleApiError('Error sending Email OTP.', err);
        },
      });
  }

  verifyEmailOtp() {

    if (!this.selectedPatient?.email_id) {
      this.toastr.error('Selected patient has no email address.');
      return;
    }

    if (!this.emailOtp) {
      this.toastr.error('Please enter the OTP.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      email: this.selectedPatient.email_id,
      otp: this.emailOtp,
    };

    this.http
      .post(`${environment.apiURL}/helper/verifyEmailOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.vstatus === 'approved') {
            this.emailVerified = true;
            this.emailOtpSent = false;
            this.emailOtp = '';
            this.toastr.success("Patient's email verified successfully!");
          } else {
            this.toastr.error(res.message || 'Invalid OTP. Please try again.');
            console.error('Verify Email OTP failed:', res);
          }
        },
        error: (err) => {
          this.handleApiError('Error verifying Email OTP.', err);
        },
      });
  }

  sendPhoneOtp() {

    if (!this.selectedPatient?.mobile_no) {
      this.toastr.error('Selected patient has no phone number.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      phone: String(this.selectedPatient.mobile_no),
      countryCode: '91',
    };

    this.http
      .post(`${environment.apiURL}/helper/sendPhoneVerifyOTP`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.vstatus === 'OTP sent successfully') {
            this.phoneOtpSent = true;
            this.toastr.success("OTP sent to patient's phone.");
          } else {
            this.toastr.error('Failed to send OTP. Please try again.');
            console.error('Send Phone OTP failed:', res);
          }
        },
        error: (err) => {
          this.handleApiError('Error sending Phone OTP.', err);
        },
      });
  }

  verifyPhoneOtp() {

    if (!this.selectedPatient?.mobile_no) {
      this.toastr.error('Selected patient has no phone number.');
      return;
    }

    if (!this.phoneOtp) {
      this.toastr.error('Please enter the OTP.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      phone: `91${String(this.selectedPatient.mobile_no)}`,
      otp: String(this.phoneOtp),
    };

    this.http
      .post(`${environment.apiURL}/helper/verifyPhone`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.vstatus === 'approved') {
            this.phoneVerified = true;
            this.phoneOtpSent = false;
            this.phoneOtp = '';
            this.toastr.success("Patient's phone verified successfully!");
          } else {
            this.toastr.error(res.message || 'Invalid OTP. Please try again.');
            console.error('Verify Phone OTP failed:', res);
          }
        },
        error: (err) => {
          this.handleApiError('Error verifying Phone OTP.', err);
        },
      });
  }

  openChangePasswordModal() {
    this.isChangePwdModalOpen = true;
    this.isProfileMenuOpen = false;
    this.initPwdForm();
    this.oldPassword = this.newPassword = this.confirmPassword = '';
  }

  closeChangePasswordModal() {
    this.isChangePwdModalOpen = false;
    this.pwdForm.reset();
    this.oldPassword = this.newPassword = this.confirmPassword = '';
  }

  submitChangePassword() {
    if (this.pwdForm.invalid) {
      this.pwdForm.markAllAsTouched(); // show all errors
      return;
    }


    this.isChangingPassword = true;

    const payload = {
      oldPassword: this.pwdForm.value.oldPassword,
      newPassword: this.pwdForm.value.newPassword,
      confirmPassword: this.pwdForm.value.confirmPassword,
    };

    this.http
      .post(`${environment.apiURL}/helper/change-password`, payload)
      .subscribe({
        next: () => {
          this.toastr.success('Password changed successfully');
          this.closeChangePasswordModal();
          this.isChangingPassword = false;
        },
        error: (err) => {
          this.isChangingPassword = false;
          this.handleApiError('Failed to change password', err);
        },
      });
  }

  fetchPatients() {

    const headers = new HttpHeaders();

    this.http
      .get(`${environment.apiURL}/helper/get-patients`, { headers })
      .subscribe({
        next: (res: any) => {
          this.patients = res.patients || [];

          // Check if self patient already exists
          this.checkSelfPatientExists();

          if (this.patients.length > 0) {
            const savedId = localStorage.getItem('selectedPatientId');
            const savedPatient = savedId
              ? this.patients.find((p) => p.patient_id.toString() === savedId)
              : null;

            this.selectedPatient = savedPatient || this.patients[0];
            localStorage.setItem(
              'selectedPatientId',
              this.selectedPatient.patient_id.toString()
            );

            this.reportData.patient_id = this.selectedPatient.patient_id;
            this.loadPatientData();
          } else {
            this.selectedPatient = null;
            this.reportData.patient_id = '';
          }
        },
        error: (err) => this.handleApiError('Error fetching patients.', err),
      });
  }

  selectPatient(patient: any) {
    this.selectedPatient = patient;
    localStorage.setItem('selectedPatientId', patient.patient_id.toString());

    this.resetOtpStates();
    this.reportData.patient_id = patient.patient_id;

    this.cdr.detectChanges(); // ← ADD

    if (this.activeTab === 'receipt') {
      this.fetchReceipts();
    } else {
      this.loadPatientData();
    }
  }

  private loadPatientData() {
    this.fetchRecords();
    this.fetchAppointments();
    this.fetchReceipts();
  }
  // Allow only numbers in OTP field
  onPhoneOtpInput(event: any) {
    const value = event.target.value || '';
    this.phoneOtp = value.replace(/[^0-9]/g, '').slice(0, 6); // Max 6 digits
  }
  private resetOtpStates() {
    this.emailOtpSent = this.phoneOtpSent = this.whatsappOtpSent = false;
    this.emailVerified = this.phoneVerified = this.whatsappVerified = false;
    this.emailVerificationToken = this.phoneVerificationToken = this.whatsappVerificationToken = null;
    this.emailOtp = this.phoneOtp = this.whatsappOtp = '';
    this.resendCountdown = 0;
    this.clearWhatsAppCountdown();
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
    }
  }

  getInitialsFromEmail(email: string): string {
    if (!email) return '';
    const parts = email.split('@')[0];
    return parts.substring(0, 2).toUpperCase();
  }

  getInitials(fname: string, lname: string): string {
    return (
      (fname?.charAt(0) || '').toUpperCase() +
      (lname?.charAt(0) || '').toUpperCase()
    );
  }

  submitConsent() {
    if (!this.isConsentAccepted) {
      this.toastr.warning('Please accept the consent terms.');
      return;
    }


    if (!this.isPositiveSafeId(this.selectedPatient?.patient_id)) {
      this.toastr.error('No patient selected or patient_id missing.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = { patient_id: this.selectedPatient.patient_id };

    this.http
      .post(`${environment.apiURL}/helper/update-consent`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          this.toastr.success(res.message || 'Consent submitted successfully!');
          this.isConsentAccepted = false;
          this.selectedPatient.patient_consent = 1;
          this.setActiveTab('consent');
        },
        error: (err) => {
          this.handleApiError('Error submitting consent.', err);
        },
      });
  }
  // Prevent typing anything except numbers
  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // Prevent pasting non-numeric values
  preventPaste(event: ClipboardEvent) {
    const pastedText = (
      event.clipboardData || (window as any).clipboardData
    ).getData('text');
    if (!/^\d+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.fileSizeError = false;

    if (file) {
      if (!this.isValidReportFile(file)) {
        this.fileSizeError = true;
        this.toastr.error('Choose a supported PNG, JPEG, or PDF file with a filename up to 255 characters and size no larger than 25 MB.');
        event.target.value = '';
        this.reportData.file = null;
        return;
      }
      this.reportData.file = file;
    } else {
      this.reportData.file = null;
    }
  }

  saveReport(form: NgForm) {
    if (
      !form.valid || this.fileSizeError ||
      !this.isPositiveSafeId(this.reportData.patient_id) ||
      (this.reportData.report_id && !this.isPositiveSafeId(this.reportData.report_id)) ||
      String(this.reportData.title || '').length > 100 ||
      !String(this.reportData.title || '').trim() ||
      String(this.reportData.mediaType || '').length > 30 ||
      !String(this.reportData.content || '').trim() ||
      this.utf8ByteLength(this.reportData.content || '') > 65535 ||
      !this.isIsoCalendarDate(this.reportData.recordDate) ||
      (this.reportData.file && !this.isValidReportFile(this.reportData.file))
    ) {
      form.form.markAllAsTouched();
      this.toastr.error('Check required fields, date, text lengths, and supported attachment constraints.');
      return;
    }


    const headers = new HttpHeaders();
    const formData = new FormData();

    formData.append('patient_id', this.reportData.patient_id);
    formData.append('title', this.reportData.title);
    formData.append('content', this.reportData.content);
    formData.append('recordDate', this.reportData.recordDate);

    // MAIN FIX: Only force 'na' when there's NO file at all
    const hasExistingFile = this.reportData.image && this.reportData.image !== 'na';
    const hasNewFile = !!this.reportData.file;

    if (hasNewFile) {
      // User uploaded a NEW file → send it
      formData.append('image', this.reportData.file);
      formData.append('mediaType', this.reportData.mediaType || '');
    } else if (hasExistingFile) {
      // No new file, but record HAD a file → preserve it
    } else {
      // No file ever existed → save 'na'
    }

    const url = this.reportData.report_id
      ? `${environment.apiURL}/helper/medreport/${this.reportData.patient_id}/${this.reportData.report_id}`
      : `${environment.apiURL}/helper/medreport`;

    const request = this.reportData.report_id
      ? this.http.put(url, formData, { headers })
      : this.http.post(url, formData, { headers });

    request.subscribe({
      next: (res: any) => {
        this.toastr.success(res.message || 'Record saved successfully!');
        this.cancelEdit();
        this.recordTab = 'view';
        this.fetchRecords();
      },
      error: (err) => this.handleApiError('Error saving record', err),
    });
  }

  today: string = new Date().toISOString().split('T')[0];
  fetchRecords() {
    if (!this.isPositiveSafeId(this.reportData.patient_id)) {
      this.medicalRecords = [];
      this.maxPosts = 0;
      this.totalPages = 1;
      return;
    }

    if (
      !Number.isInteger(this.pageSize) || this.pageSize < 1 || this.pageSize > 100 ||
      !Number.isInteger(this.currentPage) || this.currentPage < 1 || this.currentPage > 1000000
    ) {
      this.toastr.error('Report page size must be 1–100 and page must be 1–1,000,000.');
      return;
    }

    this.http
      .get(
        `${environment.apiURL}/helper/medreports/${this.reportData.patient_id}?pagesize=${this.pageSize}&page=${this.currentPage}`,
        { headers: null }
      )
      .subscribe({
        next: (res: any) => {
          if (res.message === 'Posts fetched successfully!') {
            this.medicalRecords = res.posts || [];
            this.maxPosts = res.maxPosts || 0;
            this.totalPages = Math.ceil(this.maxPosts / this.pageSize);
          } else {
            this.medicalRecords = [];
            this.maxPosts = 0;
            this.totalPages = 1;
            this.toastr.error('Failed to fetch records.');
          }
        },
        error: (err) => {
          this.handleApiError('Error fetching medical records.', err);
          this.medicalRecords = [];
          this.maxPosts = 0;
          this.totalPages = 1;
        },
      });
  }

  fetchAppointments() {
    if (!this.selectedPatient?.patient_id) {
      this.appointments = [];
      this.appointmentsMaxPosts = 0;
      this.appointmentsTotalPages = 1;
      return;
    }


    const headers = new HttpHeaders();

    this.http
      .get(
        `${environment.apiURL}/patient/appointment/${this.selectedPatient.patient_id}?pagesize=${this.appointmentsPageSize}&page=${this.appointmentsCurrentPage}`,
        { headers }
      )
      .subscribe({
        next: (res: any) => {
          if (res.message === 'Posts fetched successfully!') {
            this.appointments = res.posts || [];
            this.appointmentsMaxPosts = res.maxPosts || 0;
            this.appointmentsTotalPages = Math.ceil(
              res.maxPosts / this.appointmentsPageSize
            );
          } else {
            this.appointments = [];
            this.appointmentsMaxPosts = 0;
            this.appointmentsTotalPages = 1;
            this.toastr.error('Failed to fetch appointments.');
          }
        },
        error: (err) => {
          this.handleApiError('Error fetching appointments.', err);
          this.appointments = [];
          this.appointmentsMaxPosts = 0;
          this.appointmentsTotalPages = 1;
        },
      });
  }

  fetchReceipts() {
    if (!this.selectedPatient?.patient_id) {
      this.receipts = [];
      return;
    }


    const headers = new HttpHeaders();

    this.http
      .get<{ data: any[] }>(
        `${environment.apiURL}/patient/getappointmentreceipt/${this.selectedPatient.patient_id}`,
        { headers }
      )
      .subscribe({
        next: (res) => {
          this.receipts = (res.data || []).map((receipt) => {
            const [datePart, timePart] = (
              receipt.booking_date_time || ', '
            ).split(', ');

            // Convert "21/11/2025" → real Date object
            const parsedDate = this.parseDdMmYyyy(datePart?.trim());

            return {
              ...receipt,
              booking_date: parsedDate, // ← Now a real Date
              booking_time: timePart?.trim(),
            };
          });

          this.cdr.detectChanges();
        },
        error: (err) => {
          this.handleApiError('Error fetching receipts.', err);
          this.receipts = [];
          this.cdr.detectChanges();
        },
      });
  }

  // Helper method to convert dd/MM/yyyy → Date
  private parseDdMmYyyy(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    // parts = ['21', '11', '2025'] → rearrange to YYYY, MM-1, DD
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? null : date;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchRecords();
    }
  }

  changeAppointmentsPage(page: number) {
    if (page >= 1 && page <= this.appointmentsTotalPages) {
      this.appointmentsCurrentPage = page;
      this.fetchAppointments();
    }
  }

  get pageArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get appointmentsPageArray(): number[] {
    return Array.from({ length: this.appointmentsTotalPages }, (_, i) => i + 1);
  }

  editRecord(record: any) {
    this.reportData = {
      report_id: record.report_id,
      patient_id: record.patient_id,
      title: record.report_title || '',
      content: record.content || '',
      mediaType: record.mediaType === 'na' ? '' : record.mediaType, // ← Important!
      recordDate: record.recordDate || '',
      file: null, // ← Always null (new file not selected yet)
      image: record.imagePath === 'na' ? '' : record.imagePath, // ← Show only if real file
    };

    this.fileSizeError = false;
    this.recordTab = 'add';
  }

  deleteRecord(reportId: number) {
    // Find the record so we can show title & date in the modal
    const record = this.medicalRecords.find((r) => r.report_id === reportId);
    if (!record) {
      this.toastr.error('Record not found.');
      return;
    }

    this.recordToDelete = record;
    this.isDeleteModalOpen = true;
  }

  setScheduleTab(tab: string) {
    this.scheduleTab = tab;
  }

  isScheduleTabActive(tab: string): boolean {
    return this.scheduleTab === tab;
  }

  formatTime(time: string): string {
    if (!time) return '';
    const cleanTime = time.padStart(4, '0');
    const hours = cleanTime.substring(0, 2);
    const minutes = cleanTime.substring(2, 4);
    return `${hours}:${minutes}`;
  }

  submitAppointment(form: NgForm) {
    if (
      !form?.valid ||
      !this.isIsoCalendarDate(this.appointmentData.date) ||
      !this.appointmentData.appointmentType?.trim() ||
      this.appointmentData.appointmentType.length > 50
    ) {
      form?.form.markAllAsTouched();
      this.toastr.error('Please fill all required fields.');
      return;
    }


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      appmntDate: this.appointmentData.date,
      docType: this.appointmentData.appointmentType,
    };

    this.http
      .post(`${environment.apiURL}/helper/search`, payload, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.message === 'Search results fetched successfully') {
            this.searchResults = res.searchedResults || [];

            if (
              this.searchResults.length > 0 &&
              this.searchResults[0].doctor_id
            ) {
              localStorage.setItem(
                'doctor_id',
                this.searchResults[0].doctor_id.toString()
              );
            }

            this.toastr.success('Search results fetched successfully!');
          } else {
            this.searchResults = [];
            this.toastr.error('No search results found.');
          }
        },
        error: (err) => {
          this.handleApiError('Error fetching search results.', err);
          this.searchResults = [];
        },
      });

    this.appointmentData = { date: '', appointmentType: '' };
    if (this.scheduleForm) {
      this.scheduleForm.resetForm();
    }
  }

  fetchDoctorTypes() {

    const headers = new HttpHeaders();

    this.http
      .get(`${environment.apiURL}/admin/listdoctorTypes`, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          if (res.message === 'Retreived doctor type data successfully') {
            this.doctorTypes = res.post;
            this.availableDoctorTypes = [...this.doctorTypes];
          } else {
            this.toastr.error('Failed to fetch doctor types.');
          }
        },
        error: (err) => {
          this.handleApiError('Error fetching doctor types.', err);
        },
      });
  }

  onDateChange() {
    if (this.appointmentData.date) {
      const headers = new HttpHeaders();

      this.http
        .get(
          `${environment.apiURL}/admin/listdoctorTypes/${this.appointmentData.date}`,
          { headers }
        )
        .subscribe({
          next: (res: any) => {
            if (
              res.message === 'Retrieved doctor type data successfully' &&
              res.post.length > 0
            ) {
              this.availableDoctorTypes = res.post;
              this.appointmentData.appointmentType = '';
            } else {
              this.availableDoctorTypes = [...this.doctorTypes];
              this.toastr.info(
                'No specific doctor types available for this date.'
              );
            }
          },
          error: (err) => {
            this.handleApiError('Error fetching available doctor types.', err);
            this.availableDoctorTypes = [...this.doctorTypes];
          },
        });
    }
  }

  todayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  resetAppointmentForm() {
    this.appointmentData = { date: '', appointmentType: '' };
    this.availableDoctorTypes = [...this.doctorTypes];
    this.searchResults = [];
    if (this.scheduleForm) {
      this.scheduleForm.resetForm();
    }
  }

  bookAppointment(calendarId: number, fees: number) {

    if (!this.selectedPatient || !this.selectedPatient.patient_id) {
      this.toastr.error('No patient selected or patient_id missing.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const payload = {
      amount: Number(fees) * 100,
      calendar_id: calendarId,
      patient_id: this.selectedPatient.patient_id,
    };

    console.log('Booking appointment with payload:', payload);

    this.http
      .post(`${environment.apiURL}/patient/getorderid`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('Order ID Response:', res);

          if (res.message === 'success' && res.sub && res.sub.id) {
            const orderDetails = {
              calendar_id: calendarId,
              patient_id: this.selectedPatient.patient_id,
            };
            sessionStorage.setItem('temp', JSON.stringify(orderDetails));

            const doctorId = localStorage.getItem('doctor_id');
            const userEmail = this.selectedPatient.email_id;
            localStorage.setItem('userEmail', userEmail);

            this.razorPayOptions.key = res.ky;
            this.razorPayOptions.order_id = res.sub.id;
            this.razorPayOptions.amount = res.sub.amount;
            this.razorPayOptions.handler =
              this.razorPayResponseHandler.bind(this);

            const rzp = new Razorpay(this.razorPayOptions);
            rzp.open();

            this.toastr.info('Opening payment gateway...');
          } else {
            // Show exact backend message for other success responses (201)
            this.toastr.warning(res.message || 'Something went wrong!');
          }
        },
        error: (err) => {
          // This will catch 401, 500, etc.
          const errorMessage =
            err?.error?.message ||
            err?.message ||
            'Something went wrong. Please try again.';
          this.toastr.error(errorMessage);
        },
      });
  }

  razorPayResponseHandler(response: any) {
    console.log('Razorpay response:', response);


    const storageData = sessionStorage.getItem('temp');
    if (!storageData) {
      this.toastr.error('Order details not found. Please try again.');
      return;
    }

    const orderDetails = JSON.parse(storageData);
    const doctorId = localStorage.getItem('doctor_id');
    const emailId = localStorage.getItem('userEmail');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const verifyPaymentObj = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      calendar_id: orderDetails.calendar_id,
      doctor_id: doctorId,
      email_id: emailId,
      patient_id: this.selectedPatient.patient_id,
    };


    this.http
      .post(`${environment.apiURL}/patient/setappointment`, verifyPaymentObj, {
        headers,
      })
      .subscribe({
        next: (res: any) => {
          console.log('Payment verification response:', res);

          if (res.message === 'Appointment booked Successfully') {
            this.toastr.success('Appointment booked successfully!');

            sessionStorage.removeItem('temp');

            this.ngZone.run(() => {
              this.setActiveTab('appointments');
              this.fetchAppointments();
              if (this.activeTab === 'receipt') {
                this.fetchReceipts();
              }
            });
          } else {
            this.toastr.error(res.message || 'Failed to confirm appointment.');
          }
        },
        error: (err) => {
          this.handleApiError('Error confirming appointment.', err);
        },
      });
  }
  changePhone() {
    if (this.phoneVerified) {
      if (
        confirm(
          'To change phone number, you need to register as a parent patient. Do you agree?'
        )
      ) {
        this.router.navigate(['/register']);
      }
    }
  }
  openChangeEmailModal() {
    this.isChangeEmailModalOpen = true;
  }

  closeChangeEmailModal() {
    this.isChangeEmailModalOpen = false;
  }

  /** Close the delete-confirmation modal */
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.recordToDelete = null;
    this.isDeleting = false;
  }

  /** Called when user clicks **Yes, Delete** */
  confirmDelete() {
    if (!this.recordToDelete?.report_id) return;

    this.isDeleting = true;
    const headers = new HttpHeaders();

    this.http
      .delete(
        `${environment.apiURL}/helper/medrecords/${this.recordToDelete.report_id}`,
        { headers }
      )
      .subscribe({
        next: (res: any) => {
          this.toastr.success(
            res.message || 'Medical record deleted successfully!'
          );
          this.closeDeleteModal();
          this.fetchRecords(); // refresh list
        },
        error: (err) => {
          this.isDeleting = false;
          this.handleApiError('Error deleting medical record.', err);
        },
      });
  }

  openChangePhoneModal() {
    this.isChangePhoneModalOpen = true;
  }

  closeChangePhoneModal() {
    this.isChangePhoneModalOpen = false;
  }

  onEmailAgree() {
    this.logout();
    this.router.navigate(['/helper-register']);
  }

  onPhoneAgree() {
    this.logout();
    this.router.navigate(['/helper-register']);
  }
  changeEmail() {
    if (this.emailVerified) {
      if (
        confirm(
          'To change email, you need to register as a parent patient. Do you agree?'
        )
      ) {
        this.router.navigate(['/helper-register']);
      }
    }
  }

  cancelEdit() {
    this.reportData = {
      report_id: null,
      patient_id: this.reportData.patient_id,
      title: '',
      content: '',
      mediaType: '',
      recordDate: '',
      file: null,
      image: '',
    };
    this.fileSizeError = false;
  }

  downloadReceipt(receipt: any) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header
    doc.setFontSize(20);
    doc.text('AIMS2Health Medical Receipt', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Receipt No: ${receipt.appointment_id}`, 105, 30, {
      align: 'center',
    });
    doc.text(
      `Date: ${new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      })}`,
      105,
      40,
      { align: 'center' }
    );

    // Patient Info (assuming selectedPatient has fname and lname)
    doc.setFontSize(14);
    doc.text('Patient Details:', 20, 60);
    doc.setFontSize(12);
    doc.text(
      `Name: ${this.selectedPatient?.fname || ''} ${
        this.selectedPatient?.lname || ''
      }`,
      20,
      70
    );
    doc.text(`Patient ID: ${receipt.patient_id}`, 20, 80);

    // Receipt Details
    doc.setFontSize(14);
    doc.text('Appointment Details:', 20, 100);
    doc.setFontSize(12);
    doc.text(`Booking Date: ${receipt.booking_date}`, 20, 110);
    doc.text(`Booking Time: ${receipt.booking_time}`, 20, 120);
    doc.text(`Appointment Date: ${receipt.date}`, 20, 130);
    doc.text(`Doctor Type: ${receipt.doc_type}`, 20, 140);
    doc.text(`Amount Paid: Rs ${receipt.fees || 1}/-`, 20, 150);

    // Footer
    doc.setFontSize(10);
    doc.text('Thank you for choosing AIMS2Health!', 105, 200, {
      align: 'center',
    });
    doc.text('For any queries, contact support@aims2health.com', 105, 210, {
      align: 'center',
    });

    // Save the PDF
    doc.save(`receipt_${receipt.appointment_id}.pdf`);
  }
}

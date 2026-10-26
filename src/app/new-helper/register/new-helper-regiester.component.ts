import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-psignup',
    templateUrl: './new-helper-register.component.html',
    styleUrls: ['./new-helper-register.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NewHelperRegisterComponent implements OnDestroy {
  // === FORM FIELDS ===
  identifier = ''; // email or phone
  countryCode = '+91';
  password = '';
  looksLikePhone = false;
  isPhoneInput = false;
  confirmPassword = '';
  otp = '';

  // === UI STATE ===
  isLoading = false;
  isSendingOTP = false;
  isVerifyingOTP = false;
  showOTPInput = false;
  isVerified = false;
  resendTimer = 0;
  private interval: any;

  // === INPUT TYPE DETECTION ===
  detectedType: 'email' | 'phone' | null = null;

  // === PASSWORD STRENGTH FLAGS ===
  pwdHasCapital = false;
  pwdHasNumber = false;
  pwdMinLength = false;
  passwordByteLimitExceeded = false;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  // ———————————————————— DETECT EMAIL / PHONE ————————————————————
  detectInputType() {
    let val = this.identifier.trim();

    // Priority 1: If there's an @ symbol → definitely email
    if (val.includes('@')) {
      this.detectedType = val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ? 'email'
        : null;
      this.looksLikePhone = false;
      this.isPhoneInput = false;
      return;
    }

    // Priority 2: Extract digits
    const digitsOnly = val.replace(/\D/g, '');

    // If input has letters (but no @) → likely trying to type username part of email
    if (val.match(/[a-zA-Z]/)) {
      this.detectedType = null; // not valid yet
      this.looksLikePhone = false;
      this.isPhoneInput = false;
      return;
    }

    // Now: only digits typed so far → treat as phone
    if (digitsOnly.length > 0) {
      this.looksLikePhone = true;
      this.isPhoneInput = true;

      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      if (this.identifier !== limitedDigits) {
        this.identifier = limitedDigits;
      }

      this.detectedType = limitedDigits.length === 10 ? 'phone' : null;
    } else {
      // Empty or invalid
      this.detectedType = null;
      this.looksLikePhone = false;
      this.isPhoneInput = false;
    }
  }
  onKeyDown(event: KeyboardEvent) {
    // Allow control keys
    if (
      [8, 46, 9, 27, 13].indexOf(event.keyCode) !== -1 ||
      (event.keyCode === 65 && event.ctrlKey === true) || // Ctrl+A
      (event.keyCode === 67 && event.ctrlKey === true) || // Ctrl+C
      (event.keyCode === 86 && event.ctrlKey === true) || // Ctrl+V
      (event.keyCode === 88 && event.ctrlKey === true) // Ctrl+X
    ) {
      return;
    }

    // If we're in phone mode and have 10 digits → block further input
    if (this.looksLikePhone && this.identifier.length >= 10) {
      event.preventDefault();
      return;
    }

    // If in phone mode → only allow digits
    if (this.looksLikePhone) {
      const isDigit =
        (event.keyCode >= 48 && event.keyCode <= 57) ||
        (event.keyCode >= 96 && event.keyCode <= 105);
      if (!isDigit) {
        event.preventDefault();
      }
    }

    // Otherwise (email mode or undecided) → allow all keys
  }
  isInputValid(): boolean {
    if (!this.identifier || this.identifier.length > 100) return false;

    if (this.detectedType === 'email') {
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        this.identifier.trim()
      );
    }

    if (this.detectedType === 'phone') {
      const digits = this.identifier.replace(/\D/g, '');
      return digits.length === 10 && /^\d{10}$/.test(digits);
    }

    return false;
  }
  // ———————————————————— PASSWORD STRENGTH ————————————————————
  updatePasswordStrength() {
    this.pwdHasCapital = /[A-Z]/.test(this.password);
    this.pwdHasNumber = /[0-9]/.test(this.password);
    this.pwdMinLength = this.password.length >= 6;
    this.passwordByteLimitExceeded = new TextEncoder().encode(this.password).length > 72;
  }

  isFormValid(): boolean {
    return (
      this.isInputValid() &&
      this.isVerified &&
      this.pwdMinLength &&
      this.pwdHasCapital &&
      this.pwdHasNumber &&
      new TextEncoder().encode(this.password).length <= 72 &&
      this.password === this.confirmPassword
    );
  }

  // ———————————————————— SEND OTP ————————————————————
  sendOTP() {
    if (!this.isInputValid()) return;

    this.isSendingOTP = true;
    const requestedIdentifier = this.identifier.trim();
    const requestedType = this.detectedType;
    const payload: any = {};

    if (requestedType === 'email') {
      payload.email = requestedIdentifier;
    } else {
      const cleanPhone = requestedIdentifier.replace(/\D/g, '');
      payload.phone = cleanPhone;
      payload.countryCode = this.countryCode;
    }

    const endpoint =
      requestedType === 'email'
        ? '/helper/sendEmailVerifyOTP'
        : '/helper/sendPhoneVerifyOTP';

    this.http.post<any>(`${environment.apiURL}${endpoint}`, payload).subscribe({
      next: (res) => {
        this.isSendingOTP = false;
        const stillSameIdentifier = this.detectedType === requestedType &&
          this.identifier.trim() === requestedIdentifier;
        if (stillSameIdentifier && res?.vstatus === 'OTP sent successfully') {
          this.showOTPInput = true;
          this.toastr.info(
            'If this contact is eligible, you may receive a verification code. If you already have an account, sign in instead.'
          );
          this.startTimer();
        } else {
          this.toastr.error('Unable to process the verification request. Check the contact and try again.');
        }
      },
      error: () => {
        this.isSendingOTP = false;
        this.toastr.error('Unable to process the verification request. Check the contact and try again.');
      },
    });
  }
  // Dynamic input attributes based on detected type or current input
  get inputType(): string {
    if (this.detectedType === 'email') {
      return 'email'; // Best for email validation + keyboard hints
    }
    if (this.looksLikePhone) {
      return 'tel'; // Good for phone numbers
    }
    return 'text'; // Fallback while undecided
  }

  get inputMode(): string {
    if (this.detectedType === 'email') {
      return 'email'; // Shows @ and .com on mobile
    }
    if (this.looksLikePhone) {
      return 'numeric'; // Numeric keypad only when clearly phone
    }
    return 'text'; // Full keyboard by default
  }

  get patternAttr(): string | null {
    // Only restrict to digits when we're sure it's a phone
    return this.looksLikePhone ? '[0-9]*' : null;
  }
  // ———————————————————— VERIFY OTP ————————————————————
  verifyOTP() {
    if (this.otp.length !== 4) return;

    this.isVerifyingOTP = true;
    this.isVerified = false;
    const requestedIdentifier = this.identifier.trim();
    const requestedType = this.detectedType;
    const payload: any = { otp: this.otp };

    if (requestedType === 'email') {
      payload.email = requestedIdentifier;
    } else {
      const cleanPhone = requestedIdentifier.replace(/\D/g, '');
      payload.phone = cleanPhone;
      payload.countryCode = this.countryCode;
    }

    const endpoint =
      requestedType === 'email'
        ? '/helper/verifyEmailOTP'
        : '/helper/verifyPhoneOTP';

    this.http.post<any>(`${environment.apiURL}${endpoint}`, payload).subscribe({
      next: (res) => {
        this.isVerifyingOTP = false;
        const stillSameIdentifier = this.detectedType === requestedType &&
          this.identifier.trim() === requestedIdentifier;
        const expectedSuccess = requestedType === 'email'
          ? res?.message === 'Email verified successfully'
          : requestedType === 'phone' && res?.vstatus === 'approved';
        if (stillSameIdentifier && expectedSuccess) {
          this.isVerified = true;
          this.showOTPInput = false;
          this.otp = '';
          this.clearTimer();
          this.toastr.success(`${this.detectedType} verified!`);
        } else {
          this.toastr.error('Unable to verify that code. Check it and try again.');
        }
      },
      error: () => {
        this.isVerifyingOTP = false;
        this.toastr.error('Unable to verify that code. Check it and try again.');
      },
    });
  }

  resendOTP() {
    if (this.resendTimer > 0) return;
    this.sendOTP();
  }

  editIdentifier() {
    this.isVerified = false;
    this.isVerifyingOTP = false;
    this.showOTPInput = false;
    this.otp = '';
    this.clearTimer();
    this.resendTimer = 0;
    this.toastr.info('You can now change email/phone');
  }

  // ———————————————————— TIMER ————————————————————
  private startTimer() {
    this.resendTimer = 15;
    this.clearTimer();
    this.interval = setInterval(() => {
      if (this.resendTimer > 0) {
        this.resendTimer--;
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  // ———————————————————— REGISTER ————————————————————
  onRegister() {
    if (!this.isFormValid()) {
      this.toastr.warning('Complete all fields, verify the contact, and use a password within 72 UTF-8 bytes.');
      return;
    }

    this.isLoading = true;
    const payload: any = { password: this.password };

    if (this.detectedType === 'email') {
      payload.email_id = this.identifier.trim();
    } else {
      const cleanPhone = this.identifier.replace(/\D/g, '');
      payload.phone_no = `${this.countryCode}${cleanPhone.slice(-10)}`;
    }

    this.http
      .post<any>(`${environment.apiURL}/helper/register`, payload)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.helper_id) {
            this.toastr.success('Registration successful!');
            this.router.navigate(['/helper-login']);
          } else {
            this.toastr.error(
              'Unable to complete registration with these details. If you already have an account, sign in or reset your password.'
            );
          }
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error(
            'Unable to complete registration with these details. If you already have an account, sign in or reset your password.'
          );
        },
      });
  }

  // ———————————————————— LIFECYCLE ————————————————————
  ngOnDestroy() {
    this.clearTimer();
  }
}

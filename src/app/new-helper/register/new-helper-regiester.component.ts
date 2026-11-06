import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { getOtpErrorMessage } from '../../otp/otp-error-feedback';
import { getPasswordPolicyStatus, isPasswordPolicyValid } from '../../shared/password-policy';

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
  challengeId: string | null = null;
  emailVerificationToken: string | null = null;
  phoneVerificationToken: string | null = null;
  private verifiedEmail = '';
  private verifiedPhone = '';
  private verifiedCountryCode = '';
  private contactRevision = 0;
  resendTimer = 0;
  private interval: any;

  // === INPUT TYPE DETECTION ===
  detectedType: 'email' | 'phone' | null = null;

  // === PASSWORD STRENGTH FLAGS ===
  pwdHasCapital = false;
  pwdHasLowercase = false;
  pwdHasNumber = false;
  pwdHasSpecial = false;
  pwdHasSupportedCharacters = true;
  pwdIsCommonPassword = false;
  pwdMinLength = false;
  pwdMaxLength = true;

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
    const status = getPasswordPolicyStatus(this.password);
    this.pwdHasCapital = status.uppercase;
    this.pwdHasLowercase = status.lowercase;
    this.pwdHasNumber = status.number;
    this.pwdHasSpecial = status.special;
    this.pwdHasSupportedCharacters = status.supportedCharacters;
    this.pwdIsCommonPassword = status.commonPassword;
    this.pwdMinLength = status.minLength;
    this.pwdMaxLength = status.maxLength;
  }

  isFormValid(): boolean {
    const hasCurrentProof = this.detectedType === 'email'
      ? !!this.emailVerificationToken && this.verifiedEmail === this.identifier.trim()
      : this.detectedType === 'phone'
        ? !!this.phoneVerificationToken && this.verifiedPhone === this.identifier.replace(/\D/g, '') && this.verifiedCountryCode === this.countryCode
        : false;
    return (
      this.isInputValid() &&
      hasCurrentProof &&
      isPasswordPolicyValid(this.password) &&
      this.password === this.confirmPassword
    );
  }

  // ———————————————————— SEND OTP ————————————————————
  sendOTP() {
    if (this.isSendingOTP || this.isVerifyingOTP || !this.isInputValid()) return;

    this.isSendingOTP = true;
    const requestedIdentifier = this.identifier.trim();
    const requestedType = this.detectedType;
    const requestedCountryCode = this.countryCode;
    this.contactRevision++;
    const requestRevision = this.contactRevision;
    this.clearAllProofs();
    const isCurrentRequest = () => this.isCurrentOtpRequest(
      requestedIdentifier, requestedType, requestedCountryCode, requestRevision
    );
    const payload: any = {};

    if (requestedType === 'email') {
      payload.email = requestedIdentifier;
    } else {
      const cleanPhone = requestedIdentifier.replace(/\D/g, '');
      payload.phone = cleanPhone;
      payload.countryCode = requestedCountryCode.replace(/\D/g, '') || '91';
    }
    payload.purpose = 'helper-registration';

    const endpoint =
      requestedType === 'email'
        ? '/helper/sendEmailVerifyOTP'
        : '/helper/sendPhoneVerifyOTP';

    this.http.post<any>(`${environment.apiURL}${endpoint}`, payload).subscribe({
      next: (res) => {
        if (!isCurrentRequest()) return;
        this.isSendingOTP = false;
        if (res?.challengeId) {
          this.challengeId = res.challengeId;
        }
        if (res?.vstatus === 'OTP sent successfully') {
          this.showOTPInput = true;
          this.toastr.info(
            'If this contact is eligible, you may receive a verification code. If you already have an account, sign in instead.'
          );
          this.startTimer();
        } else {
          this.toastr.error('Unable to process the verification request. Check the contact and try again.');
        }
      },
      error: (err) => {
        if (!isCurrentRequest()) return;
        this.isSendingOTP = false;
        this.toastr.error(
          getOtpErrorMessage(
            err,
            'send',
            'Unable to process the verification request. Check the contact and try again.'
          )
        );
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
    if (this.isVerifyingOTP || this.isSendingOTP || !this.isInputValid() || this.otp.length !== 4) return;

    this.isVerifyingOTP = true;
    this.clearProof(this.detectedType);
    this.isVerified = false;
    const requestedIdentifier = this.identifier.trim();
    const requestedType = this.detectedType;
    const requestedCountryCode = this.countryCode;
    const requestRevision = this.contactRevision;
    const isCurrentRequest = () => this.isCurrentOtpRequest(
      requestedIdentifier, requestedType, requestedCountryCode, requestRevision
    );
    const cleanPhone = requestedType === 'phone' ? requestedIdentifier.replace(/\D/g, '').slice(-10) : '';
    const cleanCc = requestedType === 'phone' ? (requestedCountryCode.replace(/\D/g, '') || '91') : '';
    const cleanEmail = requestedType === 'email' ? requestedIdentifier.trim().toLowerCase() : '';

    const payload: any = { otp: this.otp, purpose: 'helper-registration' };

    if (requestedType === 'email') {
      payload.email = requestedIdentifier;
    } else {
      payload.phone = cleanPhone;
      payload.countryCode = cleanCc;
    }
    if (this.challengeId) {
      payload.challengeId = this.challengeId;
    }

    const endpoint =
      requestedType === 'email'
        ? '/helper/verifyEmailOTP'
        : '/helper/verifyPhoneOTP';

    this.http.post<any>(`${environment.apiURL}${endpoint}`, payload).subscribe({
      next: (res) => {
        if (!isCurrentRequest()) return;
        this.isVerifyingOTP = false;

        const token = res?.verificationToken;
        const hasValidToken = typeof token === 'string' && /^[a-f\d]{48}$/i.test(token);

        let isSuccess = false;
        let contactMatches = false;

        if (requestedType === 'phone') {
          isSuccess = res?.vstatus === 'approved';
          const returnedPhone = res?.phone ? String(res.phone).replace(/\D/g, '').slice(-10) : null;
          const returnedCc = res?.countryCode ? String(res.countryCode).replace(/\D/g, '') : null;
          const phoneMatches = !returnedPhone || returnedPhone === cleanPhone;
          const ccMatches = !returnedCc || returnedCc === cleanCc;
          contactMatches = phoneMatches && ccMatches;
        } else {
          isSuccess = res?.message === 'Email verified successfully' || res?.vstatus === 'approved';
          const returnedEmail = res?.email ? String(res.email).trim().toLowerCase() : null;
          contactMatches = !returnedEmail || returnedEmail === cleanEmail;
        }

        if (isSuccess && hasValidToken && contactMatches) {
          if (requestedType === 'email') {
            this.emailVerificationToken = token;
            this.verifiedEmail = requestedIdentifier;
          } else {
            this.phoneVerificationToken = token;
            this.verifiedPhone = cleanPhone;
            this.verifiedCountryCode = requestedCountryCode;
          }
          if (res?.challengeId) {
            this.challengeId = res.challengeId;
          }
          this.isVerified = true;
          this.showOTPInput = false;
          this.otp = '';
          this.clearTimer();
          this.toastr.success(`${this.detectedType} verified!`);
        } else {
          this.clearProof(requestedType);
          this.isVerified = false;
          this.toastr.error('Unable to verify that code. Check it and try again.');
        }
      },
      error: (err) => {
        if (!isCurrentRequest()) return;
        this.isVerifyingOTP = false;
        this.clearProof(requestedType);
        this.isVerified = false;
        this.toastr.error(
          getOtpErrorMessage(err, 'verify', 'Unable to verify that code. Check it and try again.')
        );
      },
    });
  }

  resendOTP() {
    if (this.isSendingOTP || this.isVerifyingOTP || this.resendTimer > 0) return;
    this.sendOTP();
  }

  editIdentifier() {
    this.contactRevision++;
    this.clearAllProofs();
    this.isSendingOTP = false;
    this.isVerifyingOTP = false;
    this.showOTPInput = false;
    this.otp = '';
    this.clearTimer();
    this.resendTimer = 0;
    this.toastr.info('You can now change email/phone');
  }

  onIdentifierInput() {
    this.contactRevision++;
    this.clearAllProofs();
    this.isSendingOTP = false;
    this.isVerifyingOTP = false;
    this.showOTPInput = false;
    this.otp = '';
    this.clearTimer();
    this.resendTimer = 0;
    this.detectInputType();
  }

  onCountryCodeChange(countryCode: string) {
    if (this.countryCode !== countryCode) {
      this.contactRevision++;
      this.clearAllProofs();
      this.isSendingOTP = false;
      this.isVerifyingOTP = false;
      this.showOTPInput = false;
      this.otp = '';
      this.clearTimer();
      this.resendTimer = 0;
    }
    this.countryCode = countryCode;
  }

  private clearAllProofs() {
    this.clearProof('email');
    this.clearProof('phone');
    this.challengeId = null;
    this.isVerified = false;
  }

  private isCurrentOtpRequest(
    identifier: string,
    type: 'email' | 'phone' | null,
    countryCode: string,
    revision: number
  ): boolean {
    return this.contactRevision === revision &&
      this.detectedType === type &&
      this.identifier.trim() === identifier &&
      this.countryCode === countryCode;
  }

  private clearProof(type: 'email' | 'phone' | null) {
    if (type === 'email') {
      this.emailVerificationToken = null;
      this.verifiedEmail = '';
    } else if (type === 'phone') {
      this.phoneVerificationToken = null;
      this.verifiedPhone = '';
      this.verifiedCountryCode = '';
    }
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
    if (this.isLoading) return;
    if (!this.isFormValid()) {
      this.toastr.warning('Complete all fields, verify the contact, and meet the password requirements.');
      return;
    }

    this.isLoading = true;
    const payload: any = { password: this.password };

    if (this.detectedType === 'email') {
      payload.email_id = this.identifier.trim();
      payload.emailVerificationToken = this.emailVerificationToken;
    } else {
      const cleanPhone = this.identifier.replace(/\D/g, '');
      payload.phone_no = cleanPhone.slice(-10);
      payload.countryCode = (this.verifiedCountryCode || this.countryCode).replace(/\D/g, '') || '91';
      payload.phoneVerificationToken = this.phoneVerificationToken;
    }

    this.http
      .post<any>(`${environment.apiURL}/helper/register`, payload)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.message === 'Helper registered successfully' &&
              Number.isInteger(res.helper_id) && res.helper_id > 0) {
            this.password = '';
            this.confirmPassword = '';
            this.toastr.success('Registration successful!');
            this.router.navigate(['/helper-login']);
          } else {
            this.toastr.error(
              'Unable to complete registration with these details. If you already have an account, sign in or reset your password.'
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error?.status === 400
            ? 'The registration request was rejected. Review the password requirements and contact fields.'
            : 'Unable to complete registration with these details. If you already have an account, sign in or reset your password.');
        },
      });
  }

  // ———————————————————— LIFECYCLE ————————————————————
  ngOnDestroy() {
    this.clearTimer();
  }
}

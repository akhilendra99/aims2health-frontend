import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PaccountService } from './paccount.service';
import { getOtpErrorMessage } from '../../otp/otp-error-feedback';

@Component({
    selector: 'app-paccountverify',
    templateUrl: './paccountverify.component.html',
    styleUrls: ['./paccountverify.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PaccountverifyComponent implements OnInit {
  isLoading = false;
  isSendingPhoneOtp = false;
  isSendingEmailOtp = false;
  isVerifyingPhoneOtp = false;
  isVerifyingEmailOtp = false;
  private authStatusSubs: Subscription;
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  acVerificationDetails: any;
  userId: number;
  userEmail: string;
  userPhone: number;
  userCountryCode: number;
  phoneV: number;
  emailV: number;

  constructor(
    public acService: PaccountService,
    public authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListner()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    this.userId = this.authService.getUserId();
    this.acVerificationDetails = this.acService
      .getAccountVerificationDetails(this.userId)
      .subscribe((data: any) => {
        this.userPhone = data.data.mobile;
        this.userEmail = data.data.email;
        this.phoneV = data.data.verify_mob;
        this.userCountryCode = data.data.countryCode;
        this.emailV = data.data.verify_email;
      });
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  sendPhoneOTP() {
    if (this.isSendingPhoneOtp) return;
    this.isSendingPhoneOtp = true;
    this.acVerificationDetails = this.acService
      .sendPhoneOTP('' + this.userPhone, '' + this.userCountryCode)
      .subscribe({
        next: (data: any) => {
          this.isSendingPhoneOtp = false;
          if (data?.vstatus === 'OTP sent successfully') {
            this.toastr.success('Verification code sent. Check your phone.');
          } else {
            this.toastr.error('Unable to send a verification code. Please try again.');
          }
        },
        error: (err) => {
          this.isSendingPhoneOtp = false;
          this.toastr.error(getOtpErrorMessage(err, 'send', 'Unable to send a verification code. Please try again.'));
        },
      });
  }

  sendEmaileOTP() {
    if (this.isSendingEmailOtp) return;
    this.isSendingEmailOtp = true;
    this.acVerificationDetails = this.acService
      .sendEmailOTP('' + this.userEmail)
      .subscribe({
        next: (data: any) => {
          this.isSendingEmailOtp = false;
          if (data?.vstatus === 'OTP sent successfully') {
            this.toastr.success('Verification code sent. Check your email.');
          } else {
            this.toastr.error('Unable to send a verification code. Please try again.');
          }
        },
        error: (err) => {
          this.isSendingEmailOtp = false;
          this.toastr.error(getOtpErrorMessage(err, 'send', 'Unable to send a verification code. Please try again.'));
        },
      });
  }

  phoneVerify(form: NgForm) {
    if (this.isVerifyingPhoneOtp || form.invalid) {
      return;
    }
    this.isLoading = true;
    this.isVerifyingPhoneOtp = true;

    this.acService
      .verifyPhone(
        '' + this.userPhone,
        '' + form.value.phoneOTP,
        '' + this.userCountryCode
      )
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          this.isVerifyingPhoneOtp = false;
          if (data?.vstatus === 'approved') {
            this.phoneV = 1;
            form.resetForm();
            this.toastr.success('Phone verification completed.');
          } else {
            this.toastr.error('The code is invalid or expired. Request a new code and try again.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.isVerifyingPhoneOtp = false;
          if (err?.status === 400 || err?.status === 401) form.resetForm();
          this.toastr.error(getOtpErrorMessage(err, 'verify', 'Unable to verify the code. Please try again.'));
        },
      });
  }

  emailVerify(form: NgForm) {
    if (this.isVerifyingEmailOtp || form.invalid) {
      return;
    }
    this.isLoading = true;
    this.isVerifyingEmailOtp = true;

    this.acService
      .verifyEmail('' + this.userEmail, '' + form.value.emailOTP)
      .subscribe({
        next: (data: any) => {
          this.isLoading = false;
          this.isVerifyingEmailOtp = false;
          if (data?.vstatus === 'approved') {
            this.emailV = 1;
            form.resetForm();
            this.toastr.success('Email verification completed.');
          } else {
            this.toastr.error('The code is invalid or expired. Request a new code and try again.');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.isVerifyingEmailOtp = false;
          if (err?.status === 400 || err?.status === 401) form.resetForm();
          this.toastr.error(getOtpErrorMessage(err, 'verify', 'Unable to verify the code. Please try again.'));
        },
      });
  }
}

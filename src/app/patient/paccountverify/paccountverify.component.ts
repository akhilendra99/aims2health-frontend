import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PaccountService } from './paccount.service';

@Component({
    selector: 'app-paccountverify',
    templateUrl: './paccountverify.component.html',
    styleUrls: ['./paccountverify.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PaccountverifyComponent implements OnInit {
  isLoading = false;
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
    //console.log("Sending OTP to phone");
    this.acVerificationDetails = this.acService
      .sendPhoneOTP('' + this.userPhone, '' + this.userCountryCode)
      .subscribe((data: any) => {
        //console.log("send phone otp res: ", data);
        //console.log("phone: ", this.userEmail);
        this.toastr.success(
          'Phone OTP Sent Successfully. Check your phone to get the OTP and enter here.',
          'Success!'
        );
      });
  }

  sendEmaileOTP() {
    //console.log("Sending OTP to email");
    this.acVerificationDetails = this.acService
      .sendEmailOTP('' + this.userEmail)
      .subscribe((data: any) => {
        //console.log("send email otp res: ", data);
        //console.log("phone: ", this.userEmail);
        this.toastr.success(
          'Email OTP Sent Successfully. Check your email to get the OTP and enter here.',
          'Success!'
        );
      });
  }

  phoneVerify(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;

    this.acService
      .verifyPhone(
        '' + this.userPhone,
        '' + form.value.phoneOTP,
        '' + this.userCountryCode
      )
      .subscribe((data: any) => {
        //console.log("verify phone otp res: ", data);
        if (data.vstatus == 'approved') {
          this.phoneV = 1;
        }
        this.isLoading = false;
      });
    console.log(form.value);
  }

  emailVerify(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;

    this.acService
      .verifyEmail('' + this.userEmail, '' + form.value.emailOTP)
      .subscribe((data: any) => {
        //console.log("verify email otp res: ", data);
        if (data.vstatus == 'approved') {
          this.emailV = 1;
        }
        this.isLoading = false;
      });
    //console.log(form.value);
  }
}

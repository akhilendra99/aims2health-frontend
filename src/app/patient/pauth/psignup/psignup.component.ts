import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-psignup',
  templateUrl: './psignup.component.html',
  styleUrls: ['./psignup.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PsignupComponent {
  fname = '';
  lname = '';
  email = '';
  password = '';
  confirmPassword = '';
  dob = '';
  mobileNo = '';
  secondaryMobile = '';
  gender = '';
  address = '';
  medicalHistory = '';
  idType = 'Aadhaar';
  idNumber = '';
  abhaId = '';
  countryCode = '91';
  isLoading = false;

  private readonly passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  private readonly phonePattern = /^\d{10}$/;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  onRegister(form: NgForm): void {
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    if (!this.passwordPattern.test(this.password)) {
      this.toastr.warning('Use an 8–16 character password with at least one number and one special character.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.toastr.warning('The passwords do not match.');
      return;
    }
    if (!this.phonePattern.test(this.mobileNo) || !this.phonePattern.test(this.secondaryMobile)) {
      this.toastr.warning('Enter both phone numbers as 10 digits.');
      return;
    }

    this.isLoading = true;
    const payload = {
      fname: this.fname.trim(),
      lname: this.lname.trim(),
      email: this.email.trim(),
      password: this.password,
      dob: this.dob,
      mobile_no: this.mobileNo,
      mobile_secondary: this.secondaryMobile,
      gender: this.gender,
      address: this.address.trim(),
      medical_history: this.medicalHistory,
      idType: this.idType,
      idNumber: this.idNumber,
      abhaId: this.abhaId,
      countrycode: this.countryCode,
    };

    this.http.post(`${environment.apiURL}/patient/signup`, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Patient registration completed. You can now sign in.');
        this.router.navigate(['/plogin']);
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Unable to complete registration with these details. If you already have an account, sign in or reset your password.');
      },
    });
  }
}

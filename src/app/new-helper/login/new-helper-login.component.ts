import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { getLoginErrorMessage } from '../../auth/login-error-feedback';

@Component({
    selector: 'app-new-helper',
    templateUrl: 'new-helper-login.component.html',
    styleUrls: ['new-helper-login.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NewHelperLoginComponent implements OnInit {
  contact: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  isForgotPasswordModalOpen: boolean = false;
  forgotPasswordEmail: string = '';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Ensure Bootstrap modal is initialized
    if (typeof bootstrap !== 'undefined') {
      const modalElement = document.getElementById('forgotPasswordModal');
      if (modalElement) {
        new bootstrap.Modal(modalElement);
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  openForgotPasswordModal() {
    this.isForgotPasswordModalOpen = true;
    const modalElement = document.getElementById('forgotPasswordModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Bootstrap not loaded or modal element not found');
      this.toastr.error('Unable to open modal. Please try again.');
    }
  }

  closeForgotPasswordModal() {
    this.isForgotPasswordModalOpen = false;
    this.forgotPasswordEmail = ''; // Clear email input
    const modalElement = document.getElementById('forgotPasswordModal');
    if (modalElement && typeof bootstrap !== 'undefined') {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  onForgotPassword() {
    const email = this.forgotPasswordEmail.trim();
    if (!this.isValidEmail(email) || email.length > 100) {
      this.toastr.warning('Enter a valid email address (maximum 100 characters).');
      return;
    }

    this.isLoading = true;

    const payload = { email };

    this.http
      .post<any>(`${environment.apiURL}/helper/forgetpwd`, payload)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.toastr.success(
            'If the account is eligible, password reset instructions will be sent.'
          );
          this.closeForgotPasswordModal();
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Unable to process that request right now. Please try again later.');
        },
      });
  }

  onLogin() {
    if (this.isLoading) return;
    const contact = this.contact.trim();
    if (!this.isValidLoginContact(contact) || !this.password.trim() || new TextEncoder().encode(this.password).length > 72) {
      this.toastr.warning('Enter a valid email or phone number and a password no longer than 72 UTF-8 bytes.');
      return;
    }

    this.isLoading = true;

    let payload: any = { password: this.password };
    if (contact.includes('@')) {
      payload.email_id = contact;
    } else {
      payload.phone_no = contact;
    }

    this.http
      .post<any>(`${environment.apiURL}/helper/login`, payload)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
            if (!res?.user || !Number.isSafeInteger(Number(res.user.helper_id)) || Number(res.user.helper_id) <= 0) {
              this.toastr.error('Unable to sign in with those details. Please try again.');
              return;
            }

            this.toastr.success('Login successful!');

          // The server-issued HttpOnly cookie is the credential. Keep helper
          // display identity in memory for the current app session only.
          this.authService.establishHelperSession(res.user);
          this.router.navigate(['/helper-dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(getLoginErrorMessage(error));

        },
      });
  }

  private isValidLoginContact(value: string): boolean {
    if (!value) return false;
    if (value.includes('@')) return this.isValidEmail(value) && value.length <= 100;
    return value.length <= 30 && /^\+?[\d\s().-]{7,30}$/.test(value);
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as bootstrap from 'bootstrap';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

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
          this.toastr.success(res.message || 'Login successful!');

          // Clear first — a previous session (possibly a different role,
          // reached without clicking that role's Logout button) must not
          // leave any of its data behind for this new session (VAPT L2
          // Finding 16).
          localStorage.clear();
          // Auth is now handled via the HttpOnly auth_token cookie set by the
          // server; only non-sensitive user info is kept client-side.
          localStorage.setItem('user', JSON.stringify(res.user));
          this.authService.establishHelperSession();
          this.router.navigate(['/helper-dashboard']);
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Unable to sign in with those details. Please try again.');

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

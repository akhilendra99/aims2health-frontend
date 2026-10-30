// pwdreset.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { getPasswordPolicyStatus, passwordPolicyValidator, passwordsMatchValidator } from '../../../shared/password-policy';

@Component({
    selector: 'app-pwdreset',
    templateUrl: './pwdreset.component.html',
    styleUrls: ['./pwdreset.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PwdresetComponent implements OnInit {
  form: UntypedFormGroup;
  isLoading = false;
  patientId: string;
  token: string;
  showPassword = false;
  showConfirm = false;

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('patientId');
    this.token = this.route.snapshot.paramMap.get('token');

    this.form = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            passwordPolicyValidator,
          ],
        ],
        password2: ['', Validators.required],
      },
      { validators: passwordsMatchValidator('password', 'password2') }
    );
  }

  get passwordRequirements() { return getPasswordPolicyStatus(this.form?.get('password')?.value); }

  onSave(): void {
    if (this.isLoading) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toastr.error('Please fix the errors below.', 'Invalid Input');
      return;
    }

    this.isLoading = true;

    const payload = {
      patient_id: this.patientId,
      token: this.token,
      password: this.form.get('password')?.value,
    };

    this.http
      .post<{ message: string }>(
        `${environment.apiURL}/patient/forgetpwdresetpwd`,
        payload
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.form.reset();
          this.toastr.success('Password updated successfully. You can now sign in.', 'Success');
          this.router.navigate(['/plogin']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error?.status === 400
            ? 'The new password does not meet the password requirements.'
            : 'Unable to update the password. The reset link may be invalid or expired.', 'Error');
        },
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }
  get f() {
    return this.form.controls;
  }
}

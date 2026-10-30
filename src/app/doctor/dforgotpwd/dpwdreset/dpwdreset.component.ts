import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { NgForm } from '@angular/forms';
import { getPasswordPolicyStatus, isPasswordPolicyValid, PASSWORD_POLICY_MESSAGE } from '../../../shared/password-policy';

@Component({
    selector: 'app-dpwdreset',
    templateUrl: './dpwdreset.component.html',
    styleUrls: ['./dpwdreset.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DpwdresetComponent implements OnInit {
  isLoading = false;
  doctorId: string;
  token;
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    public route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('docId')) {
        this.doctorId = paramMap.get('docId');
      }
      if (paramMap.has('token')) {
        this.token = paramMap.get('token');
      }
    });
  }

  passwordStatus(value: unknown) { return getPasswordPolicyStatus(value); }

  onSave(pwdForm: NgForm): void {
    if (this.isLoading) return;
    const password = pwdForm.form.value.password || '';
    const password2 = pwdForm.form.value.password2 || '';
    if (pwdForm.invalid || !isPasswordPolicyValid(password) || password !== password2) {
      pwdForm.form.markAllAsTouched();
      this.toastr.error(
        PASSWORD_POLICY_MESSAGE + ' Passwords must match.',
        'Error!'
      );
      return;
    }

    if (!this.doctorId || !this.token) {
      this.toastr.error('The reset link is invalid or expired. Request a new reset link.');
      return;
    }

    this.isLoading = true;
    this.http
      .post(`${environment.apiURL}/doctor/forgetpwdresetpwd`, {
        doc_id: this.doctorId,
        token: this.token,
        password,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          pwdForm.resetForm();
          this.toastr.success('Password updated successfully. You can now sign in.');
          this.router.navigate(['/dlogin']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(error?.status === 400
            ? 'The new password does not meet the password requirements.'
            : 'Unable to update the password. The reset link may be invalid or expired.');
        },
      });
  }
}

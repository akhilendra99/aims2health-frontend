import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DChangePWDService } from './dchangpwd.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { getPasswordPolicyStatus, isPasswordPolicyValid } from '../../shared/password-policy';


@Component({
    selector: 'app-dchangpwd',
    templateUrl: './dchangpwd.component.html',
    styleUrls: ['./dchangpwd.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DchangpwdComponent implements OnInit {


  isLoading = false;

  constructor(private apChgPwdService: DChangePWDService,  private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  passwordStatus(value: unknown) { return getPasswordPolicyStatus(value); }

  onSave(pwdForm: NgForm): void {
    if (this.isLoading) return;
    const { oldPassword, password, password2 } = pwdForm.form.value;
    if (pwdForm.invalid || !oldPassword || !isPasswordPolicyValid(password) || password !== password2) {
      pwdForm.form.markAllAsTouched();
      this.toastr.error('Review the current password, password requirements, and confirmation.', 'Invalid Input');
      return;
    }

    this.isLoading = true;
    this.apChgPwdService.updatePwd(oldPassword, password).subscribe({
      next: () => {
        this.isLoading = false;
        pwdForm.resetForm();
        this.toastr.success('Password updated successfully.', 'Success!');
        window.location.reload();
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error(error?.status === 400
          ? 'The new password does not meet the password requirements.'
          : 'Unable to update the password. Check the current password and try again.', 'Error!');
      },
    });
  }

}

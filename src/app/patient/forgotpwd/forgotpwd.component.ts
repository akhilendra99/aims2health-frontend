import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-forgotpwd',
    templateUrl: './forgotpwd.component.html',
    styleUrls: ['./forgotpwd.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ForgotpwdComponent implements OnInit {
  isLoading = false;
  isSearched = false;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onSubmit(formN: NgForm) {
    if (formN.invalid) {
      return;
    }

    this.isLoading = true;
    this.http
      .post(`${environment.apiURL}/patient/forgetpwd`, {
        email: String(formN.form.value.email).trim(),
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isSearched = true;
          this.toastr.success(
            'If the account is eligible, password reset instructions will be sent.',
            'Submit'
          );
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Unable to process that request right now. Please try again later.');
        },
      });
  }
}

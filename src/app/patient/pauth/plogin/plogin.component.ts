import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../auth/auth.service';
import { getLoginErrorMessage } from '../../../auth/login-error-feedback';

@Component({
  selector: 'app-plogin',
  templateUrl: './plogin.component.html',
  styleUrls: ['./plogin.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class PloginComponent {
  email = '';
  password = '';
  isLoading = false;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {}

  onLogin(): void {
    if (this.isLoading) return;
    const email = this.email.trim();
    if (!email || !this.password) {
      this.toastr.warning('Email and password are required');
      return;
    }

    this.isLoading = true;
    this.http
      .post<any>(`${environment.apiURL}/patient/login`, { email, password: this.password })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (!res?.userId || !res?.expiresIn) {
            this.toastr.error('Unable to sign in with those details. Please try again.');
            return;
          }

          this.toastr.success('Login successful.');
          this.authService.establishPatientSession(
            Number(res.userId),
            String(res.userEmail || email),
            String(res.userName || ''),
            Number(res.expiresIn)
          );
          this.router.navigate(['/pdashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error(getLoginErrorMessage(error));
        },
      });
  }
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

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

  onSave(pwdForm) {
    const password = pwdForm.form.value.password || '';
    const password2 = pwdForm.form.value.password2 || '';
    if (password !== password2 || password.length < 8 || password.length > 16) {
      this.toastr.error(
        'Passwords must match and be between 8 and 16 characters.',
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
          this.toastr.success('Password updated successfully. You can now sign in.');
          this.router.navigate(['/dlogin']);
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Unable to update the password. The reset link may be invalid or expired.');
        },
      });
  }
}

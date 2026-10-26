import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';
import { DoctorRegData } from '../doctor/dauth/doctor-reg-data.model';
import { HelperAuthData } from '../helper/hauth/helper-auth-data.model';
import { HelperRegData } from '../helper/hauth/helper-reg-data.model';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private tokenTimer: ReturnType<typeof setTimeout>;
  private userRole: string;
  private userId: number;
  private userEmail: string;
  private userName: string;
  private loginType: string;

  private authStatusListner = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private ngZone: NgZone
  ) {}
  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListner() {
    return this.authStatusListner.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  getLoginType() {
    return this.loginType;
  }

  getUserRole() {
    return this.userRole;
  }

  getUserEmail() {
    return this.userEmail;
  }

  getUserName() {
    return this.userName;
  }

  /** Marks a helper login as active for client-side route navigation only. */
  establishHelperSession() {
    this.establishClientSession('h', 'Helper');
  }

  establishPatientSession(userId: number, userEmail: string, userName: string, expiresIn: number) {
    this.establishClientSession('p', 'Patient');
    this.userId = userId;
    this.userEmail = userEmail;
    this.userName = userName;
    this.setAuthTimer(expiresIn);
  }

  private establishClientSession(role: string, loginType: string) {
    this.isAuthenticated = true;
    this.userRole = role;
    this.loginType = loginType;
    this.authStatusListner.next(true);
  }

  handleAuthenticationFailure() {
    if (!this.isAuthenticated) {
      return;
    }
    const loginRoute = this.userRole === 'd' ? '/dlogin'
      : this.userRole === 'a' ? '/mnbvcxzadmin'
      : this.userRole === 'h' ? '/helper-login'
      : '/plogin';
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.userRole = null;
    this.loginType = null;
    this.router.navigate([loginRoute]);
  }

  getDoctorTypes() {
    return this.http.get<[any]>(environment.apiURL + `/admin/listdoctorTypes`);
  }

  listDoctorTypes() {
    return this.http.get<[any]>(environment.apiURL + `/admin/getdoctorTypes`);
  }

  // 🔹 Doctor Registration
  createDoc(
    email: string,
    password: string,
    fname: string,
    lname: string,
    dob: Date,
    mobile_no: number,
    edu_details: string,
    adhaar: number,
    religion: string,
    doc_type: string,
    yrs_exp: number,
    reg_no: string,
    m_status: string
  ) {
    const authData: DoctorRegData = {
      email,
      password,
      fname,
      lname,
      dob,
      mobile_no,
      edu_details,
      adhaar,
      religion,
      doc_type,
      yrs_exp,
      reg_no,
      m_status,
    };
    this.http
      .post(environment.apiURL + '/doctor/signup', authData)
      .subscribe(() => {
        this.toastr.success(
          'Please login with your registered email and password to validate your registration.',
          'Registration Sucessful!'
        );
        this.router.navigate(['/dlogin']).then(() => {
          window.location.reload();
        });
      }, () => {
        this.toastr.error(
          'Unable to complete registration with these details. If you already have an account, log in or reset your password.',
          'Registration not completed'
        );
      });
  }

  // 🔹 Doctor Login
  loginDoc(email: string, password: string) {
    const authData: AuthData = { email, password };
    // withCredentials is set globally by AuthInterceptor; the server issues
    // the JWT as an HttpOnly cookie, so it's intentionally not stored client-side.
    this.http
      .post<{
        expiresIn: number;
        userId: number;
        userEmail: string;
        userName: string;
      }>(environment.apiURL + '/doctor/login', authData)
      .subscribe(
        (response) => {
          if (response && response.expiresIn) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userRole = 'd';
            this.userEmail = '' + response.userEmail;
            this.userName = '' + response.userName;
            this.loginType = 'Doctor';

            this.authStatusListner.next(true);

            this.router.navigate(['/ddashboard']);
          }
        },
        () => {
          this.toastr.error('Unable to sign in with those details. Please try again.');
          this.authStatusListner.next(false);
        }
      );
  }

  // 🔹 Admin Login
  loginAdmin(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post<{
        expiresIn: number;
        userId: number;
        userName: string;
      }>(environment.apiURL + '/admin/login', authData)
      .subscribe(
        (response) => {
          if (response && response.expiresIn) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userRole = 'a';
            // The /admin/login response doesn't echo back an email field —
            // use the value the admin actually logged in with, rather than
            // leaving this.userEmail unset (previously stored the literal
            // string "undefined" in localStorage).
            this.userEmail = email;
            this.userName = '' + response.userName;
            this.loginType = 'Admin';

            this.authStatusListner.next(true);
            this.router.navigate(['/validatedoc']);
          }
        },
        () => {
          this.toastr.error('Unable to sign in with those details. Please try again.');
          this.authStatusListner.next(false);
        }
      );
  }

  // 🔹 Helper Registration
  createHelper(
    email: string,
    password: string,
    fname: string,
    lname: string,
    dob: Date,
    mobile_no: number,
    edu_details: string,
    adhaar: number,
    religion: string,
    helper_type: string,
    m_status: string
  ) {
    const authData: HelperRegData = {
      email,
      password,
      fname,
      lname,
      dob,
      mobile_no,
      edu_details,
      adhaar,
      religion,
      helper_type,
      m_status,
    };
    this.http
      .post(environment.apiURL + '/helper/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/hlogin']);
      });
  }

  // 🔹 Helper Login (handles email OR mobile in API response)
  loginHelper(email: string, password: string, patient_email: string) {
    const authData: HelperAuthData = { patient_email, email, password };
    this.http
      .post<{
        expiresIn: number;
        userId: number;
        userEmail?: string;
        mobile?: string;
        userName: string;
      }>(environment.apiURL + '/helper/login', authData)
      .subscribe(
        (response) => {
          if (response && response.expiresIn) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;

            // 👇 keep as 'p' if pdashboard expects patient role
            this.userRole = 'p';
            this.userEmail = response.userEmail || response.mobile || '';
            this.userName = '' + response.userName;
            this.loginType = 'Helper';

            this.authStatusListner.next(true);

            this.toastr.success('Login successful', 'Welcome');

            // ✅ force Angular to navigate inside zone
            this.ngZone.run(() => {
              this.router.navigate(['/pdashboard']);
            });
          }
        },
        () => {
          this.toastr.error('Unable to sign in with those details. Please try again.');
          this.authStatusListner.next(false);
        }
      );
  }

  // 🔹 Auto Auth
  autoAuthUser() {
    // localStorage is editable by the user and cannot prove that the
    // HttpOnly auth cookie is valid or establish its server-authorized role.
    // Do not restore an authenticated client session from these UI hints.
    this.isAuthenticated = false;
    this.userId = null;
    this.userRole = null;
    this.userEmail = null;
    this.userName = null;
    this.loginType = null;
    clearTimeout(this.tokenTimer);
    ['expiration', 'userId', 'role', 'userEmail', 'userName', 'loginType']
      .forEach((key) => localStorage.removeItem(key));
    this.authStatusListner.next(false);
  }

  // 🔹 Set Timer
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  // 🔹 Logout
  logout() {
    // Cookie is sent automatically via withCredentials; the server clears it
    // and blacklists it server-side.
    const logoutPath =
      this.userRole === 'd'
        ? '/doctor/logout'
        : this.userRole === 'a'
        ? '/admin/logout'
        : this.loginType === 'Patient'
        ? '/patient/logout'
        : this.loginType === 'Helper'
        ? '/helper/logout'
        : null;
    if (logoutPath) {
      this.http
        .post(environment.apiURL + logoutPath, {})
        .subscribe({ error: () => {} }); // best-effort; client state is cleared regardless
    }
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.userRole = null;
    this.loginType = null;
    this.router.navigate(['/']);
  }

  // 🔹 Save Auth
  public saveAuthData(
    expirationDate: Date,
    userId: number,
    userRole: string,
    userEmail: string,
    userName: string,
    loginType: string
  ) {
    // Retained for compatibility with existing callers; auth metadata is no
    // longer persisted because localStorage cannot establish authorization.
    localStorage.clear();
  }

  private clearAuthData() {
    // Full clear — see admin-auth.service.ts for why (VAPT L2 Finding 16).
    localStorage.clear();
  }

  private getAuthData() {
    const expirationDate = localStorage.getItem('expiration');
    const userId = +localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    const loginType = localStorage.getItem('loginType');

    if (!expirationDate) {
      return;
    }

    return {
      expirationDate: new Date(expirationDate),
      userId,
      userRole: role,
      userEmail: email,
      userName,
      loginType,
    };
  }
}

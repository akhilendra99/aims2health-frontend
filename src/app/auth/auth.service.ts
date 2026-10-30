import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { AuthData } from './auth-data.model';
import { DoctorRegData } from '../doctor/dauth/doctor-reg-data.model';
import { HelperAuthData } from '../helper/hauth/helper-auth-data.model';
import { HelperRegData } from '../helper/hauth/helper-reg-data.model';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { getLoginErrorMessage } from './login-error-feedback';
import { clearLegacyIdentityStorage as clearStoredIdentityHints } from './auth-storage';

export interface AuthSessionResponse {
  role: 'patient' | 'doctor' | 'admin' | 'helper';
  expiresIn: number;
  userId: number;
  userEmail: string;
  userName: string;
  user?: {
    helper_id: number;
    email_id: string | null;
    mobile: string | null;
  };
}

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
  private userProfile: Record<string, any> | null = null;
  private sessionInitialization$: Observable<void> | null = null;
  private sessionStatus: 'initializing' | 'authenticated' | 'unauthenticated' = 'initializing';
  private authStateRevision = 0;

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

  getSessionStatus() {
    return this.sessionStatus;
  }

  /** Marks a helper login as active for client-side route navigation only. */
  establishHelperSession(profile?: Record<string, any>) {
    this.establishClientSession('h', 'Helper');
    this.userProfile = profile || null;
    this.userId = Number(profile?.helper_id) || null;
    this.userEmail = String(profile?.email_id || profile?.mobile || '');
    this.userName = String(profile?.name || profile?.userName || '');
  }

  getUserProfile() {
    return this.userProfile;
  }

  establishPatientSession(userId: number, userEmail: string, userName: string, expiresIn: number) {
    this.establishClientSession('p', 'Patient');
    this.userId = userId;
    this.userEmail = userEmail;
    this.userName = userName;
    this.setAuthTimer(expiresIn);
  }

  private establishClientSession(role: string, loginType: string) {
    this.authStateRevision += 1;
    this.clearLegacyIdentityStorage();
    clearTimeout(this.tokenTimer);
    this.isAuthenticated = true;
    this.sessionStatus = 'authenticated';
    this.userRole = role;
    this.loginType = loginType;
    this.userId = null;
    this.userEmail = null;
    this.userName = null;
    this.userProfile = null;
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
    this.authStateRevision += 1;
    this.sessionStatus = 'unauthenticated';
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.userRole = null;
    this.loginType = null;
    this.userEmail = null;
    this.userName = null;
    this.userProfile = null;
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
  ): Observable<any> {
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
    return this.http
      .post(environment.apiURL + '/doctor/signup', authData)
      .pipe(tap(() => {
        this.toastr.success(
          'Please login with your registered email and password to validate your registration.',
          'Registration Sucessful!'
        );
        this.router.navigate(['/dlogin']).then(() => {
          window.location.reload();
        });
      }));
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
          if (response && response.expiresIn && response.userId) {
            this.authStateRevision += 1;
            this.sessionStatus = 'authenticated';
            this.clearLegacyIdentityStorage();
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.userRole = 'd';
            this.userEmail = '' + response.userEmail;
            this.userName = '' + response.userName;
            this.userProfile = null;
            this.loginType = 'Doctor';

            this.authStatusListner.next(true);

            this.router.navigate(['/ddashboard']);
          } else {
            this.handleLoginFailure();
          }
        },
        (error) => this.handleLoginFailure(error)
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
          if (response && response.expiresIn && response.userId) {
            this.authStateRevision += 1;
            this.sessionStatus = 'authenticated';
            this.clearLegacyIdentityStorage();
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
            this.userProfile = null;
            this.loginType = 'Admin';

            this.authStatusListner.next(true);
            this.router.navigate(['/validatedoc']);
          } else {
            this.handleLoginFailure();
          }
        },
        (error) => this.handleLoginFailure(error)
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
  ): Observable<any> {
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
    return this.http
      .post(environment.apiURL + '/helper/signup', authData)
      .pipe(tap(() => {
        this.router.navigate(['/hlogin']);
      }));
  }

  // 🔹 Helper Login (handles email OR mobile in API response)
  loginHelper(email: string, password: string, patient_email: string) {
    const authData: HelperAuthData = { patient_email, email, password };
    this.http
      .post<{
        expiresIn?: number;
        userId?: number;
        userEmail?: string;
        mobile?: string;
        userName?: string;
        user?: { helper_id?: number; email_id?: string | null; mobile?: string | null };
      }>(environment.apiURL + '/helper/login', authData)
      .subscribe(
        (response) => {
          const helperId = response?.userId || response?.user?.helper_id;
          // The current helper response is { message, user } and establishes
          // the session through the HttpOnly cookie. Older deployments may
          // return the expiresIn/userId fields. No JSON token is used here.
          const expiresInDuration = response?.expiresIn || (response?.user ? 7 * 24 * 60 * 60 : 0);
          if (helperId && expiresInDuration) {
            this.establishHelperSession(response.user || {
              helper_id: helperId,
              email_id: response.userEmail,
              mobile: response.mobile,
            });
            this.setAuthTimer(expiresInDuration);
            this.userEmail = response.userEmail || response.user?.email_id || response.mobile || response.user?.mobile || '';
            this.userName = '' + (response.userName || '');

            this.authStatusListner.next(true);

            this.toastr.success('Login successful', 'Welcome');

            // ✅ force Angular to navigate inside zone
            this.ngZone.run(() => {
              this.router.navigate(['/helper-dashboard']);
            });
          } else {
            this.handleLoginFailure();
          }
        },
        (error) => this.handleLoginFailure(error)
      );
  }

  /** Validates the HttpOnly-cookie session once and restores only in-memory identity. */
  autoAuthUser(): Observable<void> {
    if (this.sessionInitialization$) {
      return this.sessionInitialization$;
    }

    this.isAuthenticated = false;
    this.userId = null;
    this.userRole = null;
    this.userEmail = null;
    this.userName = null;
    this.loginType = null;
    this.userProfile = null;
    this.sessionStatus = 'initializing';
    clearTimeout(this.tokenTimer);
    this.clearLegacyIdentityStorage();
    this.authStatusListner.next(false);

    const stateRevision = this.authStateRevision;
    this.sessionInitialization$ = this.http
      .get<AuthSessionResponse>(`${environment.apiURL}/auth/session`, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (this.authStateRevision === stateRevision) {
            this.restoreSession(response);
          }
        }),
        catchError(() => {
          if (this.authStateRevision === stateRevision) {
            this.clearInMemorySession();
            this.sessionStatus = 'unauthenticated';
          }
          return of(null);
        }),
        tap(() => {
          if (this.sessionStatus === 'initializing') {
            this.sessionStatus = this.isAuthenticated ? 'authenticated' : 'unauthenticated';
          }
        }),
        map(() => void 0),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.sessionInitialization$;
  }

  initializeSession(): Observable<void> { return this.autoAuthUser(); }

  private restoreSession(response: AuthSessionResponse | null): boolean {
    const roleMap: Record<AuthSessionResponse['role'], { role: string; loginType: string }> = {
      patient: { role: 'p', loginType: 'Patient' },
      doctor: { role: 'd', loginType: 'Doctor' },
      admin: { role: 'a', loginType: 'Admin' },
      helper: { role: 'h', loginType: 'Helper' },
    };
    const isValidIdentity = !!response &&
      Number.isSafeInteger(response.userId) && response.userId > 0 &&
      Number.isFinite(response.expiresIn) && response.expiresIn > 0 &&
      typeof response.userEmail === 'string' && typeof response.userName === 'string' &&
      Object.prototype.hasOwnProperty.call(roleMap, response.role);

    if (!isValidIdentity || !response) {
      this.clearInMemorySession();
      this.sessionStatus = 'unauthenticated';
      return false;
    }

    const mappedRole = roleMap[response.role];
    if (response.role === 'helper' &&
      (!response.user || !Number.isSafeInteger(response.user.helper_id) ||
       response.user.helper_id <= 0 || response.user.helper_id !== response.userId)) {
      this.clearInMemorySession();
      this.sessionStatus = 'unauthenticated';
      return false;
    }

    this.clearTimeoutAndSetIdentity(response, mappedRole.role, mappedRole.loginType);
    this.sessionStatus = 'authenticated';
    this.authStatusListner.next(true);
    return true;
  }

  private clearTimeoutAndSetIdentity(
    response: AuthSessionResponse,
    role: string,
    loginType: string
  ): void {
    clearTimeout(this.tokenTimer);
    this.isAuthenticated = true;
    this.userRole = role;
    this.loginType = loginType;
    this.userId = response.userId;
    this.userEmail = response.userEmail;
    this.userName = response.userName;
    this.userProfile = response.role === 'helper' ? response.user : null;
    this.setAuthTimer(response.expiresIn);
  }

  private clearInMemorySession(): void {
    clearTimeout(this.tokenTimer);
    this.isAuthenticated = false;
    this.userId = null;
    this.userRole = null;
    this.userEmail = null;
    this.userName = null;
    this.loginType = null;
    this.userProfile = null;
    this.authStatusListner.next(false);
  }

  // 🔹 Set Timer
  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private handleLoginFailure(error?: unknown) {
    this.toastr.error(getLoginErrorMessage(error));
    this.authStatusListner.next(false);
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
    this.authStateRevision += 1;
    this.sessionStatus = 'unauthenticated';
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.userRole = null;
    this.loginType = null;
    this.userEmail = null;
    this.userName = null;
    this.userProfile = null;
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
    this.clearLegacyIdentityStorage();
  }

  private clearAuthData() {
    this.clearLegacyIdentityStorage();
  }

  /** Removes obsolete identity/auth metadata while preserving unrelated UI preferences. */
  clearLegacyIdentityStorage() {
    clearStoredIdentityHints();
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { PatientAuthData } from './patient-auth-data.model';
import { PatientRegData } from './patient-reg-data.model';
import { environment } from '../../../environments/environment';
import { HelperAuthData } from '../../helper/hauth/helper-auth-data.model';
import { clearLegacyIdentityStorage } from '../../auth/auth-storage';

@Injectable({
  providedIn: 'root',
})
export class PatientAuthService {
  private isAuthenticated: boolean = false;
  public setIsAuthenticated(isAuthenticated: boolean) {
    this.isAuthenticated = isAuthenticated;
  }
  private tokenTimer: ReturnType<typeof setTimeout>;
  private userId: number;
  private authStatusListner = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListner() {
    return this.authStatusListner.asObservable();
  }

  getUserId() {
    return this.userId;
  }
  sendOtp(email: string) {
    return this.http.post<{ message: string }>(
      environment.apiURL + '/patient/send-otp-login',
      { email }
    );
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post<{
      expiresIn: number;
      userId: number;
      userEmail: string;
      userName: string;
    }>(environment.apiURL + '/patient/verify-otp-login', { email, otp });
  }

  createUser(
    email: string,
    password: string,
    fname: string,
    lname: string,
    helper_id: number,
    dob: Date,
    mobile_no: number,
    mobile_secondary: number,
    medical_history: string,
    idType: string,
    idNumber: string,
    address: string,
    gender: string,
    countrycode: string,
    abhaId: number
  ) {
    const authData: PatientRegData = {
      email: email,
      password: password,
      fname: fname,
      lname: lname,
      helper_id: helper_id,
      dob: dob,
      mobile_no: mobile_no,
      mobile_secondary: mobile_secondary,
      medical_history: medical_history,
      idType: idType,
      idNumber: idNumber,
      address: address,
      gender: gender,
      countrycode: countrycode,
      abhaId,
    };
    this.http
      .post(environment.apiURL + '/patient/signup', authData)
      .subscribe(() => {
        this.router.navigate(['/plogin']);
      });
    /*, error => {
            this.authStatusListner.next(false);
        } */
  }

  login(email: string, password: string) {
    const authData: PatientAuthData = { email: email, password: password };
    // withCredentials is set globally by AuthInterceptor; the server issues
    // the JWT as an HttpOnly cookie, so it's intentionally not stored client-side.
    this.http
      .post<{ expiresIn: number; userId: number }>(
        environment.apiURL + '/patient/login',
        authData
      )
      .subscribe(
        (response) => {
          if (response && response.expiresIn) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListner.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(expirationDate, this.userId);
            this.router.navigate(['/pdashboard']);
          }
        },
        (error) => {
          this.authStatusListner.next(false);
        }
      );
  }

  loginHelper(email: string, password: string, patient_email: string) {
    const authData: HelperAuthData = {
      patient_email: patient_email,
      email: email,
      password: password,
    };
    this.http
      .post<{ expiresIn: number; userId: number }>(
        environment.apiURL + '/patient/hlogin',
        authData
      )
      .subscribe(
        (response) => {
          if (response && response.expiresIn) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStatusListner.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            //console.log("user id:", this.userId);
            this.saveAuthData(expirationDate, this.userId);
            this.router.navigate(['/pdashboard']);
          }
        },
        (error) => {
          this.authStatusListner.next(false);
        }
      );
  }

  autoAuthUser() {
    this.isAuthenticated = false;
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.authStatusListner.next(false);
  }

  private setAuthTimer(duration: number) {
    //console.log("Setting timer: ", duration)
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000); // as setimeout() works in milli sec hence *1000
  }

  logout() {
    // Cookie is sent automatically via withCredentials; the server clears it
    // and blacklists it server-side.
    this.http.post(environment.apiURL+'/patient/logout', {})
      .subscribe({ error: () => {} }); // best-effort; client state is cleared regardless
    this.isAuthenticated = false;
    this.authStatusListner.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  public saveAuthData(expirationDate: Date, userId: number) {
    clearLegacyIdentityStorage();
  }

  private clearAuthData() {
    clearLegacyIdentityStorage();
  }
}

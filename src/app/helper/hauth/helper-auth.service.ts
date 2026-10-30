import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HelperAuthData } from './helper-auth-data.model';
import { HelperRegData } from './helper-reg-data.model';
import { environment } from '../../../environments/environment';
import { clearLegacyIdentityStorage } from '../../auth/auth-storage';


@Injectable({
    providedIn: 'root'
})
export class HelperAuthService {
    private isAuthenticated= false;
    private tokenTimer: ReturnType<typeof setTimeout>;
    private userId: number;
    private authStatusListner = new Subject<boolean>();


    constructor(private http: HttpClient, private router: Router){

    }

    getIsAuth(){
        return this.isAuthenticated;
    }

    getAuthStatusListner(){
        return this.authStatusListner.asObservable();
    }
    
    getUserId(){
        return this.userId;
    }

    createHelper(email: string, password: string, fname: string, lname: string, dob: Date, mobile_no: number, edu_details: string, adhaar: number, religion: string, helper_type: string, m_status: string){
        const authData: HelperRegData = {email: email, password: password, fname: fname, lname: lname, dob: dob, mobile_no: mobile_no, edu_details: edu_details, adhaar: adhaar, religion: religion, helper_type: helper_type, m_status: m_status };
        this.http.post(environment.apiURL+'/helper/signup', authData)
        .subscribe(() => {
            this.router.navigate(['/hlogin']);
        });
        /*, error => {
            this.authStatusListner.next(false);
        } */

    }

    login(email: string, password: string, patient_email: string){
        const authData: HelperAuthData = {patient_email: patient_email, email: email, password: password};
        // withCredentials is set globally by AuthInterceptor; the server issues
        // the JWT as an HttpOnly cookie, so it's intentionally not stored client-side.
        this.http.post<{expiresIn: number, userId: number}>(environment.apiURL+'/helper/login', authData)
        .subscribe(response => {
            if(response && response.expiresIn){
                const expiresInDuration = response.expiresIn;
                this.setAuthTimer(expiresInDuration);
                this.isAuthenticated = true;
                this.userId = response.userId;
                this.authStatusListner.next(true);
                const now = new Date();
                const expirationDate = new Date(now.getTime() + expiresInDuration*1000);
                this.saveAuthData(expirationDate, this.userId);
                this.router.navigate(['/pdashboard'])
                .then(() => {
                    window.location.reload();

                })
            }

        }, error => {
            this.authStatusListner.next(false);
        });
    }

    autoAuthUser(){
        this.isAuthenticated = false;
        this.userId = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.authStatusListner.next(false);
    }

    private setAuthTimer(duration: number){
        //console.log("Setting timer: ", duration)
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration* 1000); // as setimeout() works in milli sec hence *1000
    }

    logout(){
        // Cookie is sent automatically via withCredentials; the server clears
        // it and blacklists it server-side.
        this.http.post(environment.apiURL+'/helper/logout', {})
            .subscribe({ error: () => {} }); // best-effort; client state is cleared regardless
        this.isAuthenticated = false;
        this.authStatusListner.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userId = null;
        this.router.navigate(['/']);
    }

    private saveAuthData(expirationDate: Date, userId: number){
        clearLegacyIdentityStorage();
    }

    private clearAuthData(){
        clearLegacyIdentityStorage();
    }
}

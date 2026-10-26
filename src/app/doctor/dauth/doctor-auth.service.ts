import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DoctorAuthData } from './doctor-auth-data.model';
import { DoctorRegData } from './doctor-reg-data.model';
import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class DoctorAuthService {
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

    createDoc(email: string, password: string, fname: string, lname: string, dob: Date, mobile_no: number, edu_details: string, adhaar: number, religion: string, doc_type: string, yrs_exp: number, reg_no: string, m_status: string){
        const authData: DoctorRegData = {email: email, password: password, fname: fname, lname: lname, dob: dob, mobile_no: mobile_no, edu_details: edu_details, adhaar: adhaar, religion: religion, doc_type: doc_type, yrs_exp: yrs_exp, reg_no: reg_no, m_status: m_status };
        this.http.post(environment.apiURL+'/doctor/signup', authData)
        .subscribe(() => {
            this.router.navigate(['/dlogin']);
        });
        /*, error => {
            this.authStatusListner.next(false);
        } */

    }

    login(email: string, password: string){
        const authData: DoctorAuthData = {email: email, password: password};
        // withCredentials is set globally by AuthInterceptor; the server issues
        // the JWT as an HttpOnly cookie, so it's intentionally not stored client-side.
        this.http.post<{expiresIn: number, userId: number}>(environment.apiURL+'/doctor/login', authData)
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
                this.router.navigate(['/ddashboard']);
            }

        }, error => {
            this.authStatusListner.next(false);
        });
    }

    autoAuthUser(){
        const authInformation = this.getAuthData();
        if(!authInformation){
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if(expiresIn > 0){
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.setAuthTimer(expiresIn/1000)
            this.authStatusListner.next(true);
        }
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
        this.http.post(environment.apiURL+'/doctor/logout', {})
            .subscribe({ error: () => {} }); // best-effort; client state is cleared regardless
        this.isAuthenticated = false;
        this.authStatusListner.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userId = null;
        this.router.navigate(['/']);
    }

    private saveAuthData(expirationDate: Date, userId: number){
        // Clear first — see admin-auth.service.ts for why (VAPT L2 Finding 16).
        localStorage.clear();
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', ""+userId);
        localStorage.setItem('role','d');
    }

    private clearAuthData(){
        // Full clear — see admin-auth.service.ts for why (VAPT L2 Finding 16).
        localStorage.clear();
    }

    private getAuthData(){
        const expirationDate = localStorage.getItem('expiration');
        const userId = +localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        if(!expirationDate || role != 'd'){
            return;
        }
        return {
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }

    getDoctorDetails(userId: number){
        //console.log("before sending...");
        return this.http.get<{data: any}>(environment.apiURL+`/doctor/${userId}`);
    }
}

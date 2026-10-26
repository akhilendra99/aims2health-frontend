import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AdminAuthData } from './admin-auth-data.model';

import { environment } from '../../../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class AdminAuthService {
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

    
    login(email: string, password: string){
        const authData: AdminAuthData = {email: email, password: password};
        // withCredentials is set globally by AuthInterceptor; the server issues
        // the JWT as an HttpOnly cookie, so the token in the response body is
        // intentionally not stored anywhere on the client.
        this.http.post<{expiresIn: number, userId: number}>(environment.apiURL+'/admin/login', authData)
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
                this.router.navigate(['/validatedoc']);

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
        this.http.post(environment.apiURL+'/admin/logout', {})
            .subscribe({ error: () => {} }); // best-effort; client state is cleared regardless
        this.isAuthenticated = false;
        this.authStatusListner.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.userId = null;
        this.router.navigate(['/']);
    }

    private saveAuthData(expirationDate: Date, userId: number){
        // Clear first — a previous session (possibly a different role, e.g.
        // if logout was skipped by closing the tab) must not leave any of
        // its data behind for this new session (VAPT L2 Finding 16).
        localStorage.clear();
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', ""+userId);
        localStorage.setItem('role','a');
    }

    private clearAuthData(){
        // Full clear, not a curated list of keys — a prior session's leftover
        // data (another role's cached 'user' object, dashboard navigation
        // state like doctor_id/selectedPatientId, etc.) was found sitting in
        // localStorage indefinitely across logins/role switches, since each
        // role's logout only ever cleaned up its own narrow set of keys
        // (VAPT L2 Finding 16, Sensitive Info Exposure via Local Storage).
        localStorage.clear();
    }

    private getAuthData(){
        const expirationDate = localStorage.getItem('expiration');
        const userId = +localStorage.getItem('userId');
        const role = localStorage.getItem('role');
        if(!expirationDate || role != 'a'){
            return;
        }
        return {
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }
}
import {Injectable} from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

type ipRes = {
   
}

@Injectable({providedIn: 'root'})
export class PaccountService{

    

    //private vdetailsResultsUpdated = new Subject<{data: any}>()

    constructor(private http: HttpClient, private router: Router){

    }

    getAccountVerificationDetails(userId: number){
        //console.log("before sending...");
        return this.http.post<{data: any}>(environment.apiURL+`/patient/getvdetails`, {userId: userId});
    }

    getAppointmentReceiptDetails(userId: number){
        //console.log("before sending...");
        return this.http.post<{data: any}>(environment.apiURL+`/patient/getappointmentreceipt`, {userId: userId});
    }

    getPatientDetails(userId: number){
        //console.log("before sending...");
        return this.http.post<{data: any}>(environment.apiURL+`/patient/${userId}`, {userId: userId});
    }

    verifyPhone(phoneNumber: string, phoneOTP: string, countryCode: string){

        let verifyPhoneObj = {
            phone: phoneNumber,
            countryCode: countryCode,
            otp: phoneOTP
        }

        //console.log(verifyPhoneObj);
        
        return this.http.post<{message: string}>(environment.apiURL+`/patient/verifyPhone`, verifyPhoneObj);
    }

    verifyEmail(emailId: string, emailOTP: string){

        let verifyEmailObj = {
            email: emailId,
            otp: emailOTP
        }
        
        return this.http.post<{message: string}>(environment.apiURL+`/patient/verifyEmail`, verifyEmailObj);
    }

    sendEmailOTP(emailId: string){

        let otpObj ={
            email: emailId
        }
        
        return this.http.post<{message: string}>(environment.apiURL+`/patient/sendEmailVerifyOTP`, otpObj);
    }

    sendPhoneOTP(phoneNo: string, countryCode: string){
        let otpObj = {
            phone: phoneNo,
            countryCode: countryCode
        }
        
        return this.http.post<{message: string}>(environment.apiURL+`/patient/sendPhoneVerifyOTP`, otpObj);
    }

    sendPConsent(ip: string){
        let otpObj = {
            ip: ip
        }
        
        return this.http.post<{message: string}>(environment.apiURL+`/patient/sendConsent`, otpObj);
    }
    
}
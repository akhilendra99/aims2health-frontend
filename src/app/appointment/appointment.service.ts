import {Injectable} from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';


@Injectable({providedIn: 'root'})
export class AppointmentService{
    private appointment: any[] = [];
    private postsUpdated = new Subject<{posts:any[], postCount: number}>()

    constructor(private http: HttpClient, private router: Router, private authService: AuthService){

    }

    docScheduleAppmnt(mode: string, appmntDate: string, appmntToDate: string, appmntTime: string, timePerPatient: number, docFees: number, maxPatient: number){
        const appData={
            'mode': mode,
            'appmntDate':appmntDate,
            'appmntToDate': appmntToDate,
            'appmntTime':appmntTime,
            'perPatientTime': ""+timePerPatient,
            'docFees': ""+docFees,
            'maxPatient': ""+maxPatient
        }
        //console.log('App data:', appData)
        const appmntData = new FormData();
        appmntData.append('mode',mode);
        appmntData.append('appmntDate',appmntDate);
        appmntData.append('appmntToDate',appmntToDate);
        appmntData.append('appmntTime', appmntTime);
        appmntData.append('perPatientTime', ""+timePerPatient);
        appmntData.append('docFees', ""+docFees);
        appmntData.append('maxPatient', ""+maxPatient);
        //console.log(appmntData);
        
        this.http.post<{message: string}>(environment.apiURL+'/doctor/schedule', appData)
        .subscribe((responseData)=> {
            
            this.router.navigate(["/ddashboard"]);
        })
    }
    // docGetAppointments(postPerPage, currentPage, userId){
    //     console.log('hi')
    // }
    docGetAppointments(postsPerPage: number, currentPage: number, userId: number){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, appointment: any[], maxPosts: number}>(environment.apiURL+`/doctor/appointment/${userId}${queryParams}`)
        .subscribe((postData) => {
            this.appointment = postData.appointment;
            //console.log("Post Data: ",postData.appointment)
            this.postsUpdated.next({posts: [...this.appointment], postCount: postData.maxPosts});
        });
    }

    getPostsUpdateListener(){
        return this.postsUpdated.asObservable();
    }
    
} 
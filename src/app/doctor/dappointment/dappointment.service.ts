//import {Pappointment} from './dappointment.model';
import {Injectable} from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Post } from 'src/app/patient/pmedreport/pmedreport.model';
import { environment } from '../../../environments/environment';


@Injectable({providedIn: 'root'})
export class DappointmentService{

    private posts: any[] = [];
    private pmedreports: any[] = [];
    private postsUpdated = new Subject<{posts:any[], postCount: number}>()

    private upcomingPostsUpdated = new Subject<{posts:any[], postCount: number}>()
    private pastPostsUpdated = new Subject<{posts:any[], postCount: number}>()


    private pmedreportsUpdated = new Subject<{posts:any[], postCount: number}>()

    private pmedprescriptionsUpdated = new Subject<{posts:any[]}>()
    private pmedprescriptions: any[] = [];

    constructor(private http: HttpClient, private router: Router){

    }

    getPosts(postsPerPage: number, currentPage: number, userId: number){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: any[], maxPosts: number}>(environment.apiURL+`/doctor/appointment/${userId}${queryParams}`)
        .subscribe((postData) => {
            this.posts = postData.posts;
            //console.log("Post Data: ",postData.posts)
            this.postsUpdated.next({posts: [...this.posts], postCount: postData.maxPosts});
        });
    }


    getUpcomingPosts(postsPerPage: number, currentPage: number, userId: number){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: any[], maxPosts: number}>(environment.apiURL+`/doctor/upcomingAppointment/${userId}${queryParams}`)
        .subscribe((postData) => {
            this.posts = postData.posts;
            //console.log("Post Data: ",postData.posts)
            this.upcomingPostsUpdated.next({posts: [...this.posts], postCount: postData.maxPosts});
        });
    }

    getPastPosts(postsPerPage: number, currentPage: number, userId: number){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: any[], maxPosts: number}>(environment.apiURL+`/doctor/pastAppointment/${userId}${queryParams}`)
        .subscribe((postData) => {
            this.posts = postData.posts;
            //console.log("Post Data: ",postData.posts)
            this.pastPostsUpdated.next({posts: [...this.posts], postCount: postData.maxPosts});
        });
    }

    getPMedReports(postsPerPage: number, currentPage: number, pattientId: string){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: Post[], maxPosts: number}>(environment.apiURL+`/doctor/medreportlist/${pattientId}${queryParams}`)
        .subscribe((postData) => {
            this.pmedreports = postData.posts;
            this.pmedreportsUpdated.next({posts: [...this.pmedreports], postCount: postData.maxPosts});
        });
    }

    getPmedReportsUpdateListener(){
        return this.pmedreportsUpdated.asObservable();
    }

    getPostsUpdateListener(){
        return this.postsUpdated.asObservable();
    }

    getPastPostsUpdateListener(){
        return this.pastPostsUpdated.asObservable();
    }

    getUpcomingPostsUpdateListener(){
        return this.upcomingPostsUpdated.asObservable();
    }

    getCalendarAppointments(calendarId: number){
      
        return this.http.get<[{id: string, title: string, content: string, imagePath: string, creator: number}]>(environment.apiURL+`/doctor/patientDetails/${calendarId}`);
        
    }

    getPost(id: string){
        return this.http.get<[{id: string, title: string, content: string, imagePath: string, creator: number}]>(environment.apiURL+`/posts/${id}`);
    }

    

    updatePost(id: string, title: string, content: string, image: File | string){
        //const post: Post = {id: id, title: title, content: content, imagePath: null};
        let postData;
        if(typeof(image) === 'object'){
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        }else{
            postData ={
                id: id, 
                title: title, 
                content: content, 
                image: image,
                creator: null
            }
        }
        this.http.put(environment.apiURL+`/posts/${id}`, postData)
        .subscribe((response: {imagePath})=> {
            this.router.navigate(["/"]);
        })

    }

    deletePosts(postId: string){
        return this.http.post<{message: string}>(environment.apiURL+`/doctor/deleteAppointment`, {caledarId: postId});
    
    }

    createMeeting(postId: string, docEmail: string){
        let postData = {docEmail: docEmail};
        //console.log("Creating meeting[from service]...")
        return this.http.post<{message: any, join_url: string, start_url: string}>(environment.apiURL+`/doctor/createMeeting`, postData);
    }

    sendSmsLink(countryCode: string, phoneNumber: string, emailId: string, meetingJoinUrl: string, appointmentId: string){
        let smsLink = {
            phoneNumber: phoneNumber,
            countryCode: countryCode,
            emailId: emailId,
            meetingJoinUrl: meetingJoinUrl,
            appointmentId: appointmentId
        }
        return this.http.post<{message: any}>(environment.apiURL+`/doctor/sendSmsLink`, smsLink);
    }

    sendVSLogin(patientId: string, docId: string){
        let vsdata = {
            patientId: patientId,
            docId: docId
        }
        return this.http.post<{message: any}>(environment.apiURL+`/doctor/sendVSData`, vsdata);
    }

    toggleAppointmentState(appointmentId: string, calendarId: string){
        let postData = {
            appointmentId: appointmentId
        }
        return this.http.post<{message: any}>(environment.apiURL+`/doctor/updateAppointmentState`, postData)
        
    }
    uploadPrescription(patient_id: string, calendar_id: string, title: string, content: string, image: File){
        //console.log("Prescription uploading");

        const postData = new FormData();
        postData.append('patientId',patient_id);
        postData.append('calendarId',calendar_id);
        postData.append('title',title);
        postData.append('content', content);
        postData.append('image', image, title); // field name, file, file name
         
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/doctor/uploadprescription', postData)
        .subscribe((responseData)=> {
            window.location.reload();
            // this.router.navigate(['/pmedreport'])
            // .then(() => {
            //     window.location.reload();
            // });
        })
    }

    getPrescriptions(patientId: string, calendarId: string){
        //console.log("fetching prescriptions");
        let postData = {
            'patientId': patientId,
            'calendarId': calendarId
        }
        // postData.append('patientId',patientId);
        // postData.append('calendarId',calendarId);
        //console.log("postData:", postData);

        this.http.post<{message: string, post: any}>(environment.apiURL+'/doctor/listprescriptions', postData)
        .subscribe((postData) => {
            this.pmedprescriptions = postData.post;
            this.pmedprescriptionsUpdated.next({posts: [...this.pmedprescriptions]});
        });

    }

    getPmedPrescriptionsUpdateListener(){
        return this.pmedprescriptionsUpdated.asObservable();
    }

    getDoctorsPayments(docId: string){
        return this.http.get<{message: string, post: any}>(environment.apiURL+`/doctor/listdoctorspayments/${docId}`);
    }
} 
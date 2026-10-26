import {Pappointment} from './pappointment.model';
import {Injectable} from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


@Injectable({providedIn: 'root'})
export class PappointmentService{

    private posts: Pappointment[] = [];
    private searchedResults: any[] = [];
    private searchResultsUpdated = new Subject<{searchedResults: any[]}>()
    private postsUpdated = new Subject<{posts:Pappointment[], postCount: number}>()

    private pmedprescriptionsUpdated = new Subject<{posts:any[]}>()
    private pmedprescriptions: any[] = [];

    constructor(private http: HttpClient, private router: Router){

    }

    getDoctorTypes(){
        return this.http.get<[any]>(environment.apiURL+`/admin/listdoctorTypes`);
    }

    getDoctorTypesAndAvailability(someDate){
        return this.http.get<[any]>(environment.apiURL+`/admin/listdoctorTypes/${someDate}`);
    }

    getPosts(postsPerPage: number, currentPage: number, userId: number){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: Pappointment[], maxPosts: number}>(environment.apiURL+`/patient/appointment/${userId}${queryParams}`)
        .subscribe((postData) => {
            this.posts = postData.posts;
            //console.log("Post Data: ",postData.posts)
            this.postsUpdated.next({posts: [...this.posts], postCount: postData.maxPosts});
        });
    }

    getPostsUpdateListener(){
        return this.postsUpdated.asObservable();
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
        return this.http.delete<{message: string}>(environment.apiURL+`/posts/${postId}`);
    
    }
    

    searchDoc(appmntDate: string, docType: string){
        
        let searchQuery={
            'appmntDate': appmntDate,
            'docType': docType
        }
        //console.log(searchQuery);
        return this.http.post<{message: string, searchedResults: any[]}>(environment.apiURL+`/patient/search`, searchQuery)
    }

    requestEmergency(appmntDate: string, probDetails: string){
        
        let reqQuery={
            'appmntDate': appmntDate,
            'probDetails': probDetails
        }
        //console.log(searchQuery);
        return this.http.post<{message: string, searchedResults: any[]}>(environment.apiURL+`/patient/requestEmergency`, reqQuery)
    }

    searchDocUpdateListener(){
        this.searchResultsUpdated.asObservable();
    }

    createAppointment(orderObject: any){
        // let searchQuery={
        //     'calenderId': calenderId
        // }
        return this.http.post<{ message: string, ky: string, sub: any, status: string}>(environment.apiURL+`/patient/getorderid`, orderObject);
    }

    verifyPayment(verifyPaymentObj: any){
        console.log(verifyPaymentObj,'verifyPaymentObj')
        // let orderObject={
        //     razorpay_order_id: razorpay_order_id,
        //     razorpay_payment_id: razorpay_payment_id,
        //     razorpay_signature: razorpay_signature,
        //     calendar_id: calendar_id
        // }
        return this.http.post<{message: string}>(environment.apiURL+`/patient/setappointment`, verifyPaymentObj);
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

        this.http.post<{message: string, post: any}>(environment.apiURL+'/patient/listprescriptions', postData)
        .subscribe((postData) => {
            this.pmedprescriptions = postData.post;
            this.pmedprescriptionsUpdated.next({posts: [...this.pmedprescriptions]});
        });

    }

    getPmedPrescriptionsUpdateListener(){
        return this.pmedprescriptionsUpdated.asObservable();
    }
} 
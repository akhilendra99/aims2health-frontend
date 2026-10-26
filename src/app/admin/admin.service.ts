//import {Pappointment} from './dappointment.model';
import {Injectable} from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Post } from 'src/app/patient/pmedreport/pmedreport.model';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';


@Injectable({providedIn: 'root'})
export class AdminService{

    private posts: any[] = [];
    private pmedreports: any[] = [];
    private postsUpdated = new Subject<{posts:any[], postCount: number}>()
    private pmedreportsUpdated = new Subject<{posts:any[], postCount: number}>()

    private pmedprescriptionsUpdated = new Subject<{posts:any[]}>()
    private pmedprescriptions: any[] = [];

    constructor(private http: HttpClient, private router: Router, private toastr: ToastrService){

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
    getPMedReports(postsPerPage: number, currentPage: number, pattientId: string){
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.http.get<{message: string, posts: Post[], maxPosts: number}>(environment.apiURL+`/patient/medreportlist/${pattientId}${queryParams}`)
        .subscribe((postData) => {
            this.pmedreports = postData.posts;
            this.pmedreportsUpdated.next({posts: [...this.pmedreports], postCount: postData.maxPosts});
        });
    }

    getPmedReportsUpdateListener(){
        return this.pmedreportsUpdated.asObservable();
    }

    

    getDocs(){
        return this.http.get<[any]>(environment.apiURL+`/admin/listdoctorstovalidate`);
    }
    
    getHelpers(){
        return this.http.get<[any]>(environment.apiURL+`/admin/listhelpers`);
    }

    
    getPatients(){
        return this.http.get<[any]>(environment.apiURL+`/admin/listpatients`);
    }


    getAllPatientsListWithNumberOfBookedAppointments(){
        return this.http.get<[any]>(environment.apiURL+`/admin/listpatientswithbookings`);
    }

    getDoctors(){
        return this.http.get<[any]>(environment.apiURL+`/admin/listdoctors`);
    }

    getDoctorsPayments(docId: string){
        return this.http.get<{message: string, post: any}>(environment.apiURL+`/admin/listdoctorspayments/${docId}`);
    }

    getDoctorsExtras(){
        return this.http.get<{message: string, post: any}>(environment.apiURL+`/admin/listdoctorsextras`);
    }

    validateDoc(email_id: string){
        //console.log("Prescription uploading");

        let req_var = {email_id : email_id}
         
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/validatedoc', req_var)
        .subscribe((responseData)=> {
            
            this.router.navigate(['/validatedoc'])
            .then(() => {
                window.location.reload();
            });
        })
    }

    createNewDocType(docType: string){
        //console.log("Prescription uploading");

        let req_var = {docType : docType}
         
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/createNewDocType', req_var)
        .subscribe((responseData)=> {
            this.toastr.success('Doctor Type Created Successfully!', 'Success!');
            this.router.navigate(['/adoctypes'])
            .then(() => {
                window.location.reload();
            });
        })
    }
    updateDocType(docType: string, existingValue: string){
        //console.log("Prescription uploading");

        let req_var = {docType : docType, existingValue: existingValue}
         
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/updateDocType', req_var)
        .subscribe((responseData)=> {
            this.toastr.success('Doctor Type Updated Successfully!', 'Success!');

            this.router.navigate(['/adoctypes'])
            .then(() => {
                window.location.reload();
            });
        })
    }

    deleteDocType(docType: string){
        //console.log("Prescription uploading");

        let req_var = {docType : docType}
         
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/deleteDocType', req_var)
        .subscribe((responseData)=> {
            this.toastr.success('Doctor Type Deleted Successfully!', 'Success!');
            this.router.navigate(['/adoctypes'])
            .then(() => {
                window.location.reload();
            });
        })
    }

    getDoctorTypes(){
        return this.http.get<[any]>(environment.apiURL+`/admin/listdoctorTypes`);
    }

    listDoctorTypes(){
        return this.http.get<[any]>(environment.apiURL+`/admin/getdoctorTypes`);
    }

    addHelper(helper_id: string,patient_email: string){
        let req_var = {helper_id : helper_id, patient_email: patient_email}
         
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/updatehelperforpatient', req_var)
        .subscribe((responseData)=> {
            
            this.router.navigate(['/addhelper'])
            .then(() => {
                window.location.reload();
            });
        })
    }

    updateAmtPaid(amtPaid: number, calendarId: number, doctorId: number){

        let req_var = {calendar_id : calendarId, amount_paid: amtPaid}
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/updateAmountPaidToDoc', req_var)
        .subscribe((responseData)=> {
            
            this.router.navigate([`/adoctorspayment/${doctorId}`])
            .then(() => {
                window.location.reload();
            });
        })

    }

    updateIfsc(updatedVal: string, doctorId: number){

        let req_var = {doctor_id : doctorId, updatedValue: updatedVal}
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/updateIfsc', req_var)
        .subscribe((responseData)=> {
            
            this.router.navigate([`/adocextras`])
            .then(() => {
                window.location.reload();
            });
        })

    }

    updateAcNo(updatedVal: number, doctorId: number){

        let req_var = {doctor_id : doctorId, updatedValue: updatedVal}
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/updateAcNo', req_var)
        .subscribe((responseData)=> {
            
            this.router.navigate([`/adocextras`])
            .then(() => {
                window.location.reload();
            });
        })

    }

    updateAcName(updatedVal: string, doctorId: number){

        let req_var = {doctor_id : doctorId, updatedValue: updatedVal}
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/updateAcName', req_var)
        .subscribe((responseData)=> {
            
            this.router.navigate([`/adocextras`])
            .then(() => {
                window.location.reload();
            });
        })

    }

    updateBioDataUrl(updatedVal: string, doctorId: number){

        let req_var = {doctor_id : doctorId, updatedValue: updatedVal}
        this.http.post<{message: string, post: {imagePath: string}}>(environment.apiURL+'/admin/updateBioDataUrl', req_var)
        .subscribe((responseData)=> {
            
            this.router.navigate([`/adocextras`])
            .then(() => {
                window.location.reload();
            });
        })

    }
    
} 
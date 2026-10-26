import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PatientAuthService } from '../../pauth/patient-auth.service';
import { Pappointment } from '../pappointment.model';
import { PageEvent } from '@angular/material/paginator';
import { PappointmentService } from '../pappointment.service';
import { AuthService } from 'src/app/auth/auth.service';
import { PaccountService } from '../../paccountverify/paccount.service';


@Component({
    selector: 'app-list-pappointment',
    templateUrl: './list-pappointment.component.html',
    styleUrls: ['./list-pappointment.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListPappointmentComponent implements OnInit, OnDestroy {

  posts: Pappointment[] =[]
  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postPerPage= 6;
  currentPage = 1;
  pageSizeOptions = [1,3,6,12];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;

  acVerificationDetails: any;
  userEmail: string;
  userPhone: number;
  phoneV: number;
  emailV: number;
  p_consent: number;
  result_v: number;
  acVerify: number;

  doc_types= {'general_physician': 'General Physician',
   'cardiologist': 'Cardiologist',
    'endocrinologist': 'Endocrinologist',
    'urologist': 'Urologist',
    'cosmetic_surgeon': 'Cosmetic Surgeon',
    'orthopedic': 'Orthopedic',
    'dermatologist': 'Dermatologist',
    'gastroenterologists': 'Gastroenterologist',
    'radiologists': 'Radiologist',
    'oncologists': 'Oncologist',
    'ophthalmologists': 'Ophthalmologist',
    'anesthesiologists': 'Anesthesiologist',
    'plastic_surgeons': 'Plastic surgeon',
    'pediatricians': 'Pediatrician',
    'psychiatrists': 'Psychiatrist',
    'rheumatologists': 'Rheumatologist',  
    'neurologists': 'Neurologist',
    'nephrologists': 'Nephrologist',
    'hiv_n_infectious_disease_specialists': 'HIV/infectious disease specialist',
};


  constructor( public acService: PaccountService, public postsService: PappointmentService, private authService: AuthService ) {}



  nextStep(): void {
    return
  }

  ngOnInit(): void { 
    this.postsService.getPosts(this.postPerPage, this.currentPage, this.authService.getUserId());
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    //console.log("user id:", this.userId);
    this.postsSub = this.postsService.getPostsUpdateListener()
    .subscribe((postData: {posts:Pappointment[], postCount: number}) => {
      this.isLoading=false;
      this.posts = postData.posts;
      this.totalPosts = postData.postCount;
      //console.log(postData);
      
    });

    this.userIsAuthenticated= this.authService.getIsAuth()
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();


    });

    this.userId = this.authService.getUserId();
      this.acVerificationDetails= this.acService.getAccountVerificationDetails(this.userId)
      .subscribe((data: any) =>{
        this.userPhone = data.data.mobile;
        this.userEmail = data.data.email;
        this.phoneV = data.data.verify_mob;
        this.emailV = data.data.verify_email;
        this.p_consent= data.data.p_consent;

        this.result_v = this.phoneV * this.emailV * this.p_consent;
        this.acVerify = this.phoneV * this.emailV;

        //console.log("result Data: ", data);
        //console.log("phone: ", this.userEmail);
      })

        //to reload the page once and update the useremail and id
    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      window.location.reload();
   } else {
      localStorage.removeItem('foo')
   }
    
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(postId: string){
    //console.log(postId);
    // this.postsService.deletePosts(postId)
    // .subscribe(() => {
    //   this.postsService.getPosts(this.postPerPage, this.currentPage, this.userId);
    // }, () => {
    //   this.isLoading = false; 
    // });
  }

  onChangedPage(pageData: PageEvent){
    //console.log(pageData);
    this.isLoading=true;
    this.currentPage = pageData.pageIndex+1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage, this.userId);
  }

}

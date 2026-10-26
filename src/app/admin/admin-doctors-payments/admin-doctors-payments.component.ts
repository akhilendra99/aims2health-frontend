import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminService } from '../admin.service';
import { ActivatedRoute, ParamMap } from '@angular/router';


@Component({
    selector: 'app-admin-doctors-payments',
    templateUrl: './admin-doctors-payments.component.html',
    styleUrls: ['./admin-doctors-payments.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminDoctorsPaymentsComponent implements OnInit {

  
  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;
  posts: any[] = [];
  docId

  private mode = 'create';
  private postId: string;
  public post: any; 

  displayedColumns: string[] = ['id', 'name', 'email_id', 'mobile', 'helper', 'action'];


  constructor(public adminService: AdminService,public route: ActivatedRoute, private authService: AdminAuthService) { }

  // ngOnInit(): void {

  //   this.isLoading=true;

  //   this.adminService.getDoctors()
  //   .subscribe((postData: any) => {
  //     this.isLoading=false;
      
  //     this.posts = postData.post;
      
  //   });

    
  // }

  ngOnInit() {
    //this.docEmail = localStorage.getItem('userEmail');
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false;
      }

      
    );
    

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')){
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.docId = paramMap.get('postId');
        
        this.isLoading = true;
        this.adminService.getDoctorsPayments(""+this.postId)
        .subscribe(postData => {
          this.posts= postData.post;
          this.isLoading = false;
          //console.log("Patient Data:", postData);
          //console.log("Length:", this.patientList.length);
          
          // this.post = { 
          //   id: postData[0].id, 
          //   title: postData[0].title, 
          //   content: postData[0].content, 
          //   imagePath: postData[0].imagePath,
          //   creator: postData[0].creator
          // }
        
          
        });

        // this.form.setValue({
        //   'title': this.post.title,
        //   'content': this.post.content,
        //   'image': this.post.imagePath
        // });

      }else{
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  updateAmtPaid(paidAmount: number,calendar_id: number, doctorId: number){
    //console.log("Adding helper:", helper_id,patient_email);
    this.adminService.updateAmtPaid(paidAmount, calendar_id, doctorId);
  }


}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { DappointmentService } from '../dappointment/dappointment.service';
import { DoctorAuthService } from '../dauth/doctor-auth.service';

@Component({
    selector: 'app-doc-payments',
    templateUrl: './doc-payments.component.html',
    styleUrls: ['./doc-payments.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocPaymentsComponent implements OnInit {

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
  usrId

  private mode = 'create';
  private postId: string;
  public post: any; 

  displayedColumns: string[] = ['id', 'name', 'email_id', 'mobile', 'helper', 'action'];


  constructor(public docService: DappointmentService,public route: ActivatedRoute, private authService: AuthService) { }

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

    this.usrId= this.authService.getUserId()
    

        this.postId = this.usrId;
        this.docId = this.userId;
        
        this.isLoading = true;
        this.docService.getDoctorsPayments(""+this.postId)
        .subscribe(postData => {
          this.posts= postData.post;
          this.isLoading = false;
          
          
        });

  }

  

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminService } from '../admin.service';

@Component({
    selector: 'app-doctor-extras',
    templateUrl: './doctor-extras.component.html',
    styleUrls: ['./doctor-extras.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DoctorExtrasComponent implements OnInit {

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

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
    
    this.isLoading = true;
    this.adminService.getDoctorsExtras()
    .subscribe(postData => {
      this.posts= postData.post;
      this.isLoading = false;
    });

  }

  updateIfsc(updatedIfsc: string,  doctorId: number){
    this.adminService.updateIfsc(updatedIfsc, doctorId);
  }

  updateAcNo(updatedAcNo: number, doctorId: number){
    this.adminService.updateAcNo(updatedAcNo, doctorId);
  }
  updateAcName(updatedAcName: string, doctorId: number){
    this.adminService.updateAcName(updatedAcName, doctorId);
  }
  updateBioDataUrl(updatedBioDataUrl: string, doctorId: number){
    this.adminService.updateBioDataUrl(updatedBioDataUrl, doctorId);
  }

}

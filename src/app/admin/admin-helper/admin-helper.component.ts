import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminService } from '../admin.service';

@Component({
    selector: 'app-admin-helper',
    templateUrl: './admin-helper.component.html',
    styleUrls: ['./admin-helper.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminHelperComponent implements OnInit {

  
  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;
  posts: any[] = [];

  displayedColumns: string[] = ['id', 'helperid', 'name', 'edu_details', 'helper_type', 'email_id', 'mobile'];


  constructor(public adminService: AdminService, private authService: AdminAuthService) { }

  ngOnInit(): void {

    this.isLoading=true;

    this.adminService.getHelpers()
    .subscribe((postData: any) => {
      this.isLoading=false;
      
      this.posts = postData.post;
      
      //console.log(this.posts);
    });
  }

  
}

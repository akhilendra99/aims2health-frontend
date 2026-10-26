import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminService } from '../admin.service';
import { DialogDocValidationComponent } from './dialog-doc-validation/dialog-doc-validation.component';

@Component({
    selector: 'app-admin-doctor',
    templateUrl: './admin-doctor.component.html',
    styleUrls: ['./admin-doctor.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminDoctorComponent implements OnInit {


  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;
  posts: any[] = [];

  displayedColumns: string[] = ['id', 'doc_type', 'name', 'regno', 'email_id', 'mobile', 'validate'];


  constructor(public dialog: MatDialog, public adminService: AdminService, private authService: AdminAuthService) { }

  ngOnInit(): void {

    this.isLoading=true;

    this.adminService.getDocs()
    .subscribe((postData: any) => {
      this.isLoading=false;
      
      this.posts = postData.post;
      
      //console.log(this.posts);
    });
  }

  validateDoc(docEmail: string){
    //this.adminService.validateDoc(docEmail);

    this.dialog.open(DialogDocValidationComponent, {
      data: {
        message: `Do you really want to validate the doctor, with email: ${docEmail}?`,
        docEmail: ""+docEmail
      }
    });
  }

}

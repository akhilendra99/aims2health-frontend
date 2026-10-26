import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminService } from '../admin.service';

@Component({
    selector: 'app-admin-list-patients',
    templateUrl: './admin-list-patients.component.html',
    styleUrls: ['./admin-list-patients.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminListPatientsComponent implements OnInit {
  isLoading = false;
  totalPosts = 0;
  postPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;
  posts: any[] = [];

  displayedColumns: string[] = [
    'id',
    'name',
    'email_id',
    'mobile',
    'helper',
    'action',
  ];

  constructor(
    public adminService: AdminService,
    private authService: AdminAuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.adminService
      .getAllPatientsListWithNumberOfBookedAppointments()
      .subscribe((postData: any) => {
        this.isLoading = false;

        this.posts = postData.data;

        //console.log(this.posts);
      });
  }

  addHelper(helper_id: string, patient_email: string) {
    //console.log("Adding helper:", helper_id,patient_email);
    this.adminService.addHelper(helper_id, patient_email);
  }
}

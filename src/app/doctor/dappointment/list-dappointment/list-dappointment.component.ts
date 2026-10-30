import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AppointmentService } from 'src/app/appointment/appointment.service';
import { AuthService } from 'src/app/auth/auth.service';
import { DappointmentService } from '../dappointment.service';

@Component({
    selector: 'app-list-dappointment',
    templateUrl: './list-dappointment.component.html',
    styleUrls: ['./list-dappointment.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListDappointmentComponent implements OnInit {
  posts: any[] = [];
  appmnt_times: any[] = [
    { value: '0700', viewValue: '07:00 AM' },
    { value: '0730', viewValue: '07:30 AM' },
    { value: '0800', viewValue: '08:00 AM' },
    { value: '0830', viewValue: '08:30 AM' },
    { value: '0900', viewValue: '09:00 AM' },
    { value: '0930', viewValue: '09:30 AM' },
    { value: '1000', viewValue: '10:00 AM' },
    { value: '1030', viewValue: '10:30 AM' },
    { value: '1100', viewValue: '11:00 AM' },
    { value: '1130', viewValue: '11:30 AM' },
    { value: '1200', viewValue: '12:00 PM' },
    { value: '1230', viewValue: '12:30 PM' },
    { value: '1300', viewValue: '01:00 PM' },
    { value: '1330', viewValue: '01:30 PM' },
    { value: '1400', viewValue: '02:00 PM' },
    { value: '1430', viewValue: '02:30 PM' },
    { value: '1500', viewValue: '03:00 PM' },
    { value: '1530', viewValue: '03:30 PM' },
    { value: '1600', viewValue: '04:00 PM' },
    { value: '1630', viewValue: '04:30 PM' },
    { value: '1700', viewValue: '05:00 PM' },
    { value: '1730', viewValue: '05:30 PM' },
    { value: '1800', viewValue: '06:00 PM' },
    { value: '1830', viewValue: '06:30 PM' },
    { value: '1900', viewValue: '07:00 PM' },
    { value: '1930', viewValue: '07:30 PM' },
    { value: '2000', viewValue: '08:00 PM' },
    { value: '2030', viewValue: '08:30 PM' },
    { value: '2100', viewValue: '09:00 PM' },
    { value: '2130', viewValue: '09:30 PM' },
    { value: '2200', viewValue: '10:00 PM' },
  ];

  appointmentData: {
    avg_time_p_ptnt: string;
    calendar_id: string;
    date: string;
    time: string;
    doctor_id: string;
    fees: string;
    max_patients: string;
  }[] = [];

  meetingCreated = false;
  meetingStartUrl = '';
  meetingJoinUrl = '';

  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 1;
  postPerPage = 9;
  currentPage = 1;
  pageSizeOptions = [9];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;
  docEmail: string;

  //  variables for bootstrap pagination

  b_totalPosts = 1;
  b_postPerPage = 9;
  b_currentPage = 1;
  b_pageSizeOptions = [9];
  b_no_of_pages = 1;

  constructor(
    public appmntService: DappointmentService,
    private authService: AuthService
  ) {}

  nextStep(): void {
    return;
  }

  ngOnInit(): void {
    this.docEmail = this.authService.getUserEmail();
    this.appmntService.getPosts(
      this.postPerPage,
      this.currentPage,
      this.authService.getUserId()
    );
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    //console.log("user id:", this.userId);
    this.postsSub = this.appmntService
      .getPostsUpdateListener()
      .subscribe((postData: { posts: any[]; postCount: number }) => {
        this.isLoading = false;

        this.posts = postData.posts;
        //this.appointmentData =
        this.totalPosts = postData.postCount;
        this.b_totalPosts = postData.postCount;

        this.b_no_of_pages = Math.ceil(this.totalPosts / this.b_postPerPage);

        console.log('Total post:', this.totalPosts);
      });

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListner()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    //to reload the page once and update the useremail and id
    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload');
      window.location.reload();
    } else {
      localStorage.removeItem('foo');
    }
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(postId: string) {
    this.appmntService.deletePosts(postId).subscribe(
      () => {
        this.appmntService.getPosts(
          this.b_postPerPage,
          this.b_currentPage,
          this.userId
        );
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  createMeeting(postId: string) {
    //console.log("Creating meeting...");
    this.appmntService
      .createMeeting(postId, this.docEmail)
      .subscribe((data) => {
        //console.log(data);
        this.isLoading = false;
        this.meetingCreated = true;
        this.meetingStartUrl = data.start_url;
        this.meetingJoinUrl = data.join_url;
        //console.log(this.meetingStartUrl);
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex;
    this.postPerPage = pageData.pageSize;
    this.totalPosts = pageData.length;
    this.appmntService.getPosts(
      this.postPerPage,
      pageData.pageIndex + 1,
      this.userId
    );
    // this.postsSub = this.appmntService.getPostsUpdateListener()
    // .subscribe((postData: {posts:any[], postCount: number}) => {
    //   this.isLoading=false;

    //   this.posts = postData.posts;
    //   //this.appointmentData =
    //   this.totalPosts = postData.postCount;
    //   console.log("Total post:", this.totalPosts)
    // });
  }

  onChangedPageBootstrap(pageIndex: number) {
    //this.pageEvent = e;
    this.isLoading = true;
    this.b_currentPage = pageIndex;
    this.appmntService.getPosts(
      this.b_postPerPage,
      this.b_currentPage,
      this.userId
    );
  }
}


import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PatientAuthService } from '../pauth/patient-auth.service';
import { PageEvent } from '@angular/material/paginator';
import { Pappointment } from './pappointment.model';


@Component({
    selector: 'app-pappointments',
    templateUrl: './pappointments.component.html',
    styleUrls: ['./pappointments.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PappointmentsComponent implements OnInit {

  posts: Pappointment[] =[]
  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;


  //constructor(public postsService: any, private authService: PatientAuthService ) {}

  constructor() {}


  nextStep(): void {
    return
  }

  ngOnInit(): void { 
    
  }

}
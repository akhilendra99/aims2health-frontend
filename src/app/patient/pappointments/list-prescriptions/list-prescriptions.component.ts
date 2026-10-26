import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../../pmedreport/pmedreport.model';
import { PappointmentService } from '../pappointment.service';

@Component({
    selector: 'app-list-prescriptions',
    templateUrl: './list-prescriptions.component.html',
    styleUrls: ['./list-prescriptions.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListPrescriptionsComponent implements OnInit {

  form: UntypedFormGroup;
  imagePreview: string;

  posts: Post[] =[]
  patientId;
  calendarId;
  patientFname;
  patientLname;
  private postsSub: Subscription;
  private prescriptionSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;

  prescriptions: any=[];
  appointmentReceipts: any[]=[];
  displayedColumns: string[] = ['prescription_id', 'report_title', 'content', 'filePath'];


  constructor(public postsService: PappointmentService, public route: ActivatedRoute, private authService: AuthService ) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('calendarId')){
        this.calendarId= paramMap.get('calendarId')
      }else{
        return;
      }
      
      if(paramMap.has('patientId')){
        this.patientId = paramMap.get('patientId');
      }else{
        return;
      }
    });

    this.prescriptions = this.postsService.getPrescriptions(this.patientId, this.calendarId);
    // console.log("Prescriptions:", this.prescriptions);

    this.prescriptionSub = this.postsService.getPmedPrescriptionsUpdateListener()
    .subscribe((postData: {posts:any}) => {
      this.isLoading=false;
      this.prescriptions = postData.posts;
      //this.totalPosts = postData.postCount;
      //console.log("Prescriptions:", this.prescriptions)
      
    });

  }

}

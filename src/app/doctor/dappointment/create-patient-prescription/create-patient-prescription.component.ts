import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from 'src/app/patient/pmedreport/pmedreport.model';
import { DappointmentService } from '../dappointment.service';
import { mimeType } from './mime-type.validator'
import { ToastrService } from 'ngx-toastr';



@Component({
    selector: 'app-create-patient-prescription',
    templateUrl: './create-patient-prescription.component.html',
    styleUrls: ['./create-patient-prescription.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CreatePatientPrescriptionComponent implements OnInit {

  displayedColumns: string[] = ['prescription_id', 'report_title', 'content', 'filePath'];

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

  prescriptions: any =[]
  
  constructor(public postsService: DappointmentService, public route: ActivatedRoute, private authService: AuthService, private toastr: ToastrService ) {}



  nextStep(): void {
    return
  }

  
  ngOnInit(): void { 



    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
    this.form = new UntypedFormGroup({
      'title': new UntypedFormControl(null, {
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(20)]
      }),
      'content': new UntypedFormControl(null, {
        validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      }),
      'image': new UntypedFormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType]
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('calendarId')){
        this.calendarId= paramMap.get('calendarId')
      }
      if(paramMap.has('pFname')){
        this.patientFname= paramMap.get('pFname');
      }
      if(paramMap.has('pLname')){
        this.patientLname= paramMap.get('pLname');
      }
      if(paramMap.has('patientId')){
        this.patientId = paramMap.get('patientId');
        this.isLoading = true;
        this.postsService.getPMedReports(this.postPerPage, this.currentPage, this.patientId);
        this.isLoading = true;
        this.userId = this.authService.getUserId();
        this.postsSub = this.postsService.getPmedReportsUpdateListener()
        .subscribe((postData: {posts:Post[], postCount: number}) => {
          this.isLoading=false;
          this.posts = postData.posts;
          this.totalPosts = postData.postCount;
          
        });

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

    this.userIsAuthenticated= this.authService.getIsAuth()
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();

    });


  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  

  onChangedPage(pageData: PageEvent){
    //console.log(pageData);
    this.isLoading=true;
    this.currentPage = pageData.pageIndex+1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPMedReports(this.postPerPage, this.currentPage, this.patientId);
  }

  onImagePicked(event: Event){
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    //reader.fileName = file.name
    reader.onload= () => {
      this.imagePreview = file.name as string;
    }
    reader.readAsDataURL(file);
    // console.log(file);
    // console.log(this.form);
  }
  
  onSavePost(){

    if(this.form.invalid){
      return
    }

    this.isLoading = true;
    
    this.postsService.uploadPrescription(this.patientId, this.calendarId, this.form.value.title, this.form.value.content, this.form.value.image);
    
    this.isLoading = false;
    this.form.reset();
  }
  sendVSLogin() {
    // Open the URL in a new tab
    const ehrUrl = "https://ehr.aims2.health/plastic_cloud/";
    window.open(ehrUrl, '_blank');
  
    // Now proceed with the API call
    this.postsService.sendVSLogin(this.patientId, ""+this.userId)
      .subscribe((data) => {
        // Handle the API response
        this.toastr.success('Updated VS Logins', 'Success!');
      });
  }
  sendVSLogin1() {
    // Open the URL in a new tab
    const ehrUrl = "http://51.38.122.57/plastic/";
    window.open(ehrUrl, '_blank');
  
    // Now proceed with the API call
    this.postsService.sendVSLogin(this.patientId, ""+this.userId)
      .subscribe((data) => {
        // Handle the API response
        this.toastr.success('Updated VS Logins', 'Success!');
      });
  }
  
}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { DappointmentService } from '../dappointment.service';

@Component({
    selector: 'app-list-patients-calendar',
    templateUrl: './list-patients-calendar.component.html',
    styleUrls: ['./list-patients-calendar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListPatientsCalendarComponent implements OnInit {

  enteredContent='';
  enteredTitle='';
  isLoading = false;
  form: UntypedFormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;
  public post: any; 
  private authStatusSub: Subscription;
  
  appointmentId;
  meetingCreated = false;
  meetingStartUrl = '';
  meetingJoinUrl = '';

  docEmail='';

  patientList :any[]=[];

  constructor(public postsService: DappointmentService, public route: ActivatedRoute, private authService: AuthService, private toastr: ToastrService ) { 

  }

  ngOnInit() {
    //console.log("Doc email:",localStorage.getItem('userEmail'));
    this.docEmail = this.authService.getUserEmail();
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false;
      }

      
    );
    

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')){
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.appointmentId = paramMap.get('postId');
        //console.log("AppointmentID:", this.appointmentId);
        //console.log(paramMap.get('postId'));
        this.isLoading = true;
        this.postsService.getCalendarAppointments(+this.postId)
        .subscribe(postData => {
          this.patientList= postData;
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

  createMeeting(postId: string){
    //console.log("Creating meeting...");
    this.postsService.createMeeting(postId, this.docEmail)
    .subscribe((data) => {
      //console.log(data);
      this.isLoading = false;
      this.meetingCreated = true;
      this.meetingStartUrl = data.start_url;
      this.meetingJoinUrl = data.join_url;
      //console.log(this.meetingStartUrl);  
    });

  }

  sendSmsLink(countryCode: string, phoneNumber: string, emailId: string, appointmentId: string){
    if(this.meetingCreated  == false){
      return;
    }else{
      this.postsService.sendSmsLink(countryCode, phoneNumber, emailId, this.meetingJoinUrl, appointmentId)
      .subscribe((data) => {
        //console.log(data);
        this.toastr.success('Link Send Successfully.', 'Success!');
      });
    }
  }

  toggleConsultationState(appointmentId: string, caledarId: string){
    console.log("Toggle function was clicked, appointment id:", appointmentId);
    this.postsService.toggleAppointmentState(appointmentId, caledarId)
      .subscribe((data) => {
        //console.log(data);
        this.toastr.success('Appointment State Updated Successfully.', 'Success!');

        window.location.reload();
      });
  }

  getBool(value){
    return true;
  }
  
}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { DoctorAuthService } from '../dauth/doctor-auth.service';

@Component({
    selector: 'app-dprofile',
    templateUrl: './dprofile.component.html',
    styleUrls: ['./dprofile.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DprofileComponent implements OnInit {

  isLoading = false;
  private authStatusSubs: Subscription;
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  reg_no: string;
  acDetails: any;
  consentRes: any;
  userId: number;

  doc_types: any[] = [
    { value: 'general_physician', viewValue: 'General Physician' },
    { value: 'cardiologist', viewValue: 'Cardiologist' },
    { value: 'endocrinologist', viewValue: 'Endocrinologist' },
    { value: 'urologist', viewValue: 'Urologist' },
    { value: 'cosmetic_surgeon', viewValue: 'Cosmetic Surgeon' },
    { value: 'orthopedic', viewValue: 'Orthopedic' },
    { value: 'dermatologist', viewValue: 'Dermatologist' },
    { value: 'gastroenterologists', viewValue: 'Gastroenterologists' },
    { value: 'radiologists', viewValue: 'Radiologists' },
    { value: 'oncologists', viewValue: 'Oncologists' },
    { value: 'ophthalmologists', viewValue: 'Ophthalmologists' },
    { value: 'anesthesiologists', viewValue: 'Anesthesiologists' },
    { value: 'plastic_surgeons', viewValue: 'Plastic surgeons' },
    { value: 'pediatricians', viewValue: 'Pediatricians' },
    { value: 'psychiatrists', viewValue: 'Psychiatrists' },
    { value: 'rheumatologists', viewValue: 'Rheumatologists' },
    { value: 'neurologists', viewValue: 'Neurologists' },
    { value: 'nephrologists', viewValue: 'Nephrologists' },
    { value: 'hiv_n_infectious_disease_specialists', viewValue: 'HIV/infectious disease specialists' },
  ];

  constructor(public acService: DoctorAuthService, public authService: AuthService, private http:HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.isLoading=true;
    this.userIsAuthenticated= this.authService.getIsAuth()
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });

    this.userId = this.authService.getUserId();
    
    this.acDetails= this.acService.getDoctorDetails(this.userId)
    .subscribe((data: any) =>{
      //console.log("Doc result:", data.res[0]);
      this.acDetails = data.res[0];
      this.acDetails.dob=this.acDetails.dob.split('T')[0].split('-').reverse().join('/');
      this.acDetails.reg_no=this.acDetails.registration_no;
      if (this.acDetails.adhaar == "-1"){
          this.acDetails.adhaar = "N/A";
      }

      this.acDetails.doc_type= this.acDetails.doc_type.split("_").join(" ").toUpperCase(); 
      
      
      // console.log("result Data: ", this.acDetails);
      this.isLoading=false;
    })

    
    
  }

}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PaccountService } from '../paccountverify/paccount.service';

@Component({
    selector: 'app-pprofile',
    templateUrl: './pprofile.component.html',
    styleUrls: ['./pprofile.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PprofileComponent implements OnInit {

  isLoading = false;
  private authStatusSubs: Subscription;
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  pin_code: string;
  acDetails: any;
  consentRes: any;
  userId: number;
  gender: string;

  constructor(public acService: PaccountService, public authService: AuthService, private http:HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.isLoading=true;
    this.userIsAuthenticated= this.authService.getIsAuth()
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });

    this.userId = this.authService.getUserId();
    
    this.acDetails= this.acService.getPatientDetails(this.userId)
    .subscribe((data: any) =>{
      this.acDetails = data.data[0];
      this.acDetails.dob=this.acDetails.dob.split('T')[0].split('-').reverse().join('/');
      this.pin_code=this.acDetails.address.split(' ')[1];
      if (this.acDetails.adhaar == "-1"){
        this.acDetails.adhaar = "N/A";
      }

      this.gender = this.acDetails.gender.slice(0, 1).toUpperCase() + this.acDetails.gender.slice(1, );
      
      
      //console.log("result Data: ", this.acDetails);
      this.isLoading=false;
    })

    
    
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PatientAuthService } from 'src/app/patient/pauth/patient-auth.service';
import { HelperAuthService } from '../helper-auth.service';

@Component({
    selector: 'app-hlogin',
    templateUrl: './hlogin.component.html',
    styleUrls: ['./hlogin.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HloginComponent implements OnInit {

  
  isLoading = false;
  private authStatusSubs: Subscription;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusSubs = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false; 
      }
    );
  }

  ngOnDestroy(): void {
    this.authStatusSubs.unsubscribe();
  }

  onLogin(form : NgForm){
    if(form.invalid){
      return;
    }
    this.isLoading = true;

    this.authService.loginHelper(form.value.email, form.value.password, form.value.p_email);
    //console.log(form.value);
  }

}

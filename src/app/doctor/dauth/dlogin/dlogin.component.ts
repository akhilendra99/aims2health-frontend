import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { DoctorAuthService } from '../doctor-auth.service';

@Component({
    selector: 'app-dlogin',
    templateUrl: './dlogin.component.html',
    styleUrls: ['./dlogin.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DloginComponent implements OnInit {

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
    if (this.isLoading) return;
    if(form.invalid){
      return;
    }
    this.isLoading = true;

    this.authService.loginDoc(form.value.email, form.value.password);
    //console.log(form.value);
  }

}

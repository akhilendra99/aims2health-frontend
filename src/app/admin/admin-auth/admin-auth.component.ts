import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { AdminAuthService } from './admin-auth.service';

@Component({
    selector: 'app-admin-auth',
    templateUrl: './admin-auth.component.html',
    styleUrls: ['./admin-auth.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminAuthComponent implements OnInit {

  
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

    this.authService.loginAdmin(form.value.email, form.value.password);
    //console.log(form.value);
  }

}

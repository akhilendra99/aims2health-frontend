import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {Location} from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';


@Component({
    selector: 'app-internal-header',
    templateUrl: './internal-header.component.html',
    styleUrls: ['./internal-header.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class InternalHeaderComponent implements OnInit {

  userisAuthenticated = false;
  userRole = null;
  userEmail = null;
  userId = null;
  userName = null;
  userFname = '';
  loginType='';

  private authListnerSubs: Subscription;
  private userEmailSubs: Subscription;
  private userIdSubs: Subscription;
  constructor(private authService: AuthService, private _location: Location) { }

  ngOnInit(): void {
    this.userisAuthenticated = this.authService.getIsAuth();
    this.getUserName();
    this.userRole = this.authService.getUserRole();
    this.userId = this.authService.getUserId();
    this.userEmail = ""+localStorage.getItem('userEmail');
    this.loginType =this.authService.getLoginType();
    this.authListnerSubs = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userisAuthenticated = isAuthenticated;
      
    });

  

  }

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy(){
    this.authListnerSubs.unsubscribe();
  }
  getUserName(){
    this.userName =this.authService.getUserName();
    this.userFname = this.userName.split(" ")[0];
    console.log("user name:", this.userName);
    return
  }

  isPatient(){
    if( this.authService.getUserRole() === 'p'){
      return true;
    }else{
      return false;
    }
  }

  isDoctor(){
    if( this.authService.getUserRole() === 'd'){
      return true;
    }else{
      return false;
    }
  }

  isAdmin(){
    if( this.authService.getUserRole() === 'a'){
      return true;
    }else{
      return false;
    }
  }
  backClicked() {
    this._location.back();
  }

}

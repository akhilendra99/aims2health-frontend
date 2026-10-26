import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { PatientAuthService } from '../patient/pauth/patient-auth.service';
import {Location} from '@angular/common';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  userisAuthenticated = false;
  userRole = null;
  userEmail = null;
  userId = null;
  private authListnerSubs: Subscription;
  private userEmailSubs: Subscription;
  private userIdSubs: Subscription;
  constructor(private authService: AuthService, private _location: Location) { }

  ngOnInit(): void {
    this.userisAuthenticated = this.authService.getIsAuth();
    this.userRole = this.authService.getUserRole();
    this.userId = this.authService.getUserId();
    this.userEmail = ""+localStorage.getItem('userEmail');
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

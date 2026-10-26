import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import {Location} from '@angular/common';


@Component({
    selector: 'app-footer-public',
    templateUrl: './footer-public.component.html',
    styleUrls: ['./footer-public.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class FooterPublicComponent implements OnInit {

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

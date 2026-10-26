import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';


@Component({
    selector: 'app-welcome-box',
    templateUrl: './welcome-box.component.html',
    styleUrls: ['./welcome-box.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class WelcomeBoxComponent implements OnInit {

  userisAuthenticated = false;
  userRole = null;
  userEmail = null;
  private authListnerSubs: Subscription;
  constructor(private authService: AuthService, private _location: Location) { }

  ngOnInit(): void {
    this.userisAuthenticated = this.authService.getIsAuth();
    this.userRole = this.authService.getUserRole();
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
  
}

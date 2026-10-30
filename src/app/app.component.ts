import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { PatientAuthService } from './patient/pauth/patient-auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppComponent implements OnInit {
  
  title = 'angular-frontend';

  constructor(private authService: AuthService){}

  ngOnInit(){
    this.authService.initializeSession().subscribe();
  } 
}

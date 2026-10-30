import { Component, ElementRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import {Location} from '@angular/common';


@Component({
    selector: 'app-doctor-navbar',
    templateUrl: './doctor-navbar.component.html',
    styleUrls: ['./doctor-navbar.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DoctorNavbarComponent implements OnInit {

  c
  menuToggler: any;
  cssbody: any;
  popup: any;
  closeBtn: any;


  userisAuthenticated = false;
  userRole = null;
  userEmail = null;
  userId = null;
  userName = null;
  private authListnerSubs: Subscription;
  private userEmailSubs: Subscription;
  private userIdSubs: Subscription;
  constructor(private authService: AuthService, private _location: Location, private elementRef: ElementRef) { }

  ngOnInit(): void {

    this.menuToggler = this.selectElement('.menu-toggle');
    this.cssbody = this.selectElement('nav');


    this.userisAuthenticated = this.authService.getIsAuth();
    this.getUserName();
    this.userRole = this.authService.getUserRole();
    this.userId = this.authService.getUserId();
    this.userEmail = String(this.authService.getUserEmail() || '');
    this.authListnerSubs = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userisAuthenticated = isAuthenticated;
      
    });

  

  }

  ngAfterViewInit(): void {
    //throw new Error('Method not implemented.');
    this.popup = this.elementRef.nativeElement.querySelector('.popup');
    this.closeBtn = this.elementRef.nativeElement.querySelector('.close');
    //this.cssbody.classList.remove('open');
    //this.displayPopup();
    
  }
  selectElement(element: any){
    return document.querySelector(element);
  }

  closePopup(){
    this.popup.style.display = 'none';
  }


  displayPopup(){
    
    this.popup.style.display = 'block'; 
        
  
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

  getUserName(){
    this.userName =this.authService.getUserName();
    return
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

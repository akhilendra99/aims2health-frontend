import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HelperAuthService } from '../helper-auth.service';
import { HelperAuthData } from '../helper-auth-data.model';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialogBoxComponent } from 'src/app/auth/auth-dialog-box/auth-dialog-box.component';

@Component({
    selector: 'app-hsignup',
    templateUrl: './hsignup.component.html',
    styleUrls: ['./hsignup.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HsignupComponent implements OnInit {

  isLoading = false;
  private authStatusSubs: Subscription;

  emailExpression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  passwordExpression: RegExp = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/; 
  phoneExpression: RegExp = /^\d{10}$/;
  aadharExpression: RegExp = /^\d{16}$/;
  yrsExpression: RegExp = /^\d{1,2}$/;
  educationDetailsExpression: RegExp = /^[a-zA-Z0-9 ]{2,200}$/;  
  registrationNoExpression: RegExp = /^[a-zA-Z0-9]{6,20}$/;  

  h_types: any[] = [
    { value: 'general_helper', viewValue: 'General Helper' },
    { value: 'medical_intern', viewValue: 'Medical Intern' },
  ];

  m_status: any[] = [
    {value: 'married', viewValue: 'Married'},
    {value: 'unmarried', viewValue: 'Un-Married'},
    {value: 'divorced', viewValue: 'Divorced'},
    {value: 'na', viewValue: 'Do not wish to disclose'},
  ]

  religions: any[] = [
    {value: 'hindu', viewValue: 'Hindu'},
    {value: 'islam', viewValue: 'Islam'},
    {value: 'christian', viewValue: 'Christian'},
    {value: 'sikh', viewValue: 'Sikh'},
    {value: 'jain', viewValue: 'Jain'},
    {value: 'other', viewValue: 'Other'},
    {value: 'na', viewValue: 'Do not wish to disclose'},
  ]

  // multiplication table
private d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], 
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], 
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], 
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], 
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], 
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], 
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], 
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], 
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

// permutation table
private p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], 
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], 
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], 
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], 
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], 
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], 
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

// validates Aadhar number received as string
  validate(aadharNumber) {
    let c = 0
    let invertedArray = aadharNumber.split('').map(Number).reverse()

    invertedArray.forEach((val, i) => {
      c = this.d[c][this.p[(i % 8)][val]]
    })

    return (c === 0)
  }

  
  constructor(public dialog: MatDialog, public authService : AuthService) { }
  ngOnDestroy(): void {
    this.authStatusSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.authStatusSubs = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false; 
      }
    );
  }

  onSignup(form: NgForm){
    if(form.invalid ){

      if(form.value.fname ==''|| form.value.lname =='' ){
        //alert("Please enter your first name and last name correctly!");
        //this.toastr.error('Please enter your first name and last name correctly!', 'Error!');
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The First name and the Last name cannot be empty.`,
          }
        });
        
        return;
      }
      if(String(form.value.fname).length > 20|| String(form.value.lname).length > 30 ){
        //alert("Please enter your first name and last name correctly!");
        //this.toastr.error('Please enter your first name and last name correctly!', 'Error!');
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The First name and the Last name cannot be that long. Please use short version of your legal name.`,
          }
        });
        
        return;
      }
      else if(form.value.email == '' ){
        //alert("Please enter your email!");
        //this.toastr.error('Please enter your first name and last name correctly!');
        
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The Email field cannot be empty.`,
          }
        });
        
        console.log("err 3")
         return;
       }
      else if (!this.emailExpression.test(form.value.email)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The entered email id is invalid! Please provide a valid email.`,
          }
        });
        
        console.log("email validation failed")
         return;
      }
      else if(form.value.dob == '' ){
        //this.toastr.error('Please enter your first name and last name correctly!');
        //alert("Please enter your date of birth!");
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The Date of birth field cannot be empty.`,
          }
        });
        console.log("err 1")
        return;
      }
      else if(form.value.password==form.value.password2 && form.value.password2 == ''){
        //this.toastr.error('Please enter a password!');
        //alert("Please enter a password!");
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The Password and Repeat Password fields cannot be empty and both of them should match.`,
          }
        });

        console.log("err 2")
        return;
      }
      else if(form.value.password!=form.value.password2){
        //this.toastr.error('Please enter your first name and last name correctly!');
        //alert("The passwords doesnt match!");
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The Password and Repeat Password doesnot match! Please make sure they both are the same.`,
          }
        });
        console.log("err 2")
        return;
      }  
      else if (!this.passwordExpression.test(form.value.password)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The length of the entered password should be between 8 to 16 characters and it should contain atleast one number and one special character.`,
          }
        });
        
        console.log("passowrd validation failed")
         return;
      }      
      else if(form.value.phone == ''){
        //alert("Please enter your phone number!");
        //this.toastr.error('Please enter your first name and last name correctly!');
        
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The phone number field cannot be blank! Please enter your phone numbers.`,
          }
        });
        console.log("err 4")
        return;
      }
      else if(!this.phoneExpression.test(form.value.phone)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The Phone number entered can only be of 10 digits.`,
          }
        });
        return;
      }
      else if(!this.aadharExpression.test(form.value.adhaar)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The Aadhar number field cannot be blank and it can only be of 16 digits and it should not have any spaces in between.`,
          }
        });
        return;
      }
      else if(!this.educationDetailsExpression.test(form.value.edu_details)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The education details must not be empty and should not contain any special character. It can have only letters, numbers and spaces.`,
          }
        });
        return;
      }
      else if(form.value.helper_type == ''){
        //alert("Please enter your gender!");
        //this.toastr.error('Please enter your first name and last name correctly!');
        
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `Please select a helper type from the dropdown.`,
          }
        });
        console.log("err 3")
         return;
      }


      return;
    }else{
      //if(!this.validate(""+form.value.adhaar) && form.value.password!=form.value.password2){
      if(form.value.password!=form.value.password2){
        return;
      }else{
        this.isLoading = true;
        if(form.value.adhaar == ""){
          form.value.adhaar=-1;
        }
        form.value.religion="na";
        form.value.m_status="na";
        this.authService.createHelper(form.value.email, form.value.password, form.value.fname, form.value.lname, form.value.dob, form.value.phone, form.value.edu_details, form.value.adhaar, form.value.religion, form.value.helper_type, form.value.m_status);
        //console.log(form.value);
      }
    }
  }

}

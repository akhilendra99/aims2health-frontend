import { AfterViewInit, Component, ElementRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthDialogBoxComponent } from 'src/app/auth/auth-dialog-box/auth-dialog-box.component';
import { AuthService } from 'src/app/auth/auth.service';
import { getPasswordPolicyStatus, isPasswordPolicyValid, PASSWORD_POLICY_MESSAGE } from '../../../shared/password-policy';

@Component({
    selector: 'app-dsignup',
    templateUrl: './dsignup.component.html',
    styleUrls: ['./dsignup.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DsignupComponent implements OnInit, AfterViewInit {

  isLoading = false;
  private authStatusSubs: Subscription;

  posts: any[] = [];

  emailExpression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  phoneExpression: RegExp = /^\d{10}$/;
  yrsExpression: RegExp = /^\d{1,2}$/;
  educationDetailsExpression: RegExp = /^[a-zA-Z0-9 ]{2,200}$/;  
  registrationNoExpression: RegExp = /^[a-zA-Z0-9]{6,20}$/;  


  menuToggler: any;
  cssbody: any;
  popup: any;
  closeBtn: any;


  timeLeft: number = 60;
  interval: any;

  genders: any[] = [
    {value: 'male', viewValue: 'Male'},
    {value: 'female', viewValue: 'Female'},
    {value: 'other', viewValue: 'Other'},
  ]

  doc_types: any[] = [
    { value: 'general_physician', viewValue: 'General Physician' },
    { value: 'cardiologist', viewValue: 'Cardiologist' },
    { value: 'endocrinologist', viewValue: 'Endocrinologist' },
    { value: 'urologist', viewValue: 'Urologist' },
    { value: 'cosmetic_surgeon', viewValue: 'Cosmetic Surgeon' },
    { value: 'orthopedic', viewValue: 'Orthopedic' },
    { value: 'dermatologist', viewValue: 'Dermatologist' },
    { value: 'gastroenterologists', viewValue: 'Gastroenterologists' },
    { value: 'radiologists', viewValue: 'Radiologists' },
    { value: 'oncologists', viewValue: 'Oncologists' },
    { value: 'ophthalmologists', viewValue: 'Ophthalmologists' },
    { value: 'anesthesiologists', viewValue: 'Anesthesiologists' },
    { value: 'plastic_surgeons', viewValue: 'Plastic surgeons' },
    { value: 'pediatricians', viewValue: 'Pediatricians' },
    { value: 'psychiatrists', viewValue: 'Psychiatrists' },
    { value: 'rheumatologists', viewValue: 'Rheumatologists' },
    { value: 'neurologists', viewValue: 'Neurologists' },
    { value: 'nephrologists', viewValue: 'Nephrologists' },
    { value: 'hiv_n_infectious_disease_specialists', viewValue: 'HIV/infectious disease specialists' },
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
    {value: 'na', viewValue: 'Do not wish to disclouse'},
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

  constructor(public dialog: MatDialog, public authService : AuthService, private elementRef: ElementRef) { }
  ngOnDestroy(): void {
    this.authStatusSubs.unsubscribe();
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

  ngOnInit(): void {
    this.menuToggler = this.selectElement('.menu-toggle');
    this.cssbody = this.selectElement('nav');

    this.authService.listDoctorTypes()
    .subscribe((postData: any) => {
      this.isLoading=false;
      
      this.posts = postData.post;
      
      console.log(this.posts);
    });

    this.authStatusSubs = this.authService.getAuthStatusListner().subscribe(
      authStatus => {
        this.isLoading = false; 
      }
    );
  }

  onSignup(form: NgForm){
    if (this.isLoading) return;
    if (!isPasswordPolicyValid(form.value.password) || form.value.password !== form.value.password2) {
      this.dialog.open(AuthDialogBoxComponent, { data: { message: PASSWORD_POLICY_MESSAGE + ' Passwords must match.' } });
      return;
    }
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
      else if (!isPasswordPolicyValid(form.value.password)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: PASSWORD_POLICY_MESSAGE,
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
      else if(!this.educationDetailsExpression.test(form.value.edu_details)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The education details must not be empty and should not contain any special character. It can have only letters, numbers and spaces.`,
          }
        });
        return;
      }
      else if(form.value.gender == ''){
        //alert("Please enter your gender!");
        //this.toastr.error('Please enter your first name and last name correctly!');
        
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `Please select a gender from the dropdown.`,
          }
        });
        console.log("err 3")
         return;
      }
      else if(form.value.doc_type == ''){
        //alert("Please enter your gender!");
        //this.toastr.error('Please enter your first name and last name correctly!');
        
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `Please select a doctor type from the dropdown.`,
          }
        });
        console.log("err 3")
         return;
      }
      else if(!this.yrsExpression.test(form.value.yrs_exp)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The years of experience must not be empty and should not contain only number upto 2 digits.`,
          }
        });
        return;
      }
      else if(!this.registrationNoExpression.test(form.value.reg_no)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The registration number field must not be empty or should not be less than 6 characters and should contain only numbers and letters without spaces.`,
          }
        });
        return;
      }
      
      //this.toastr.error('Please enter your first name and last name correctly!');
      alert("Please enter your registration form correctly!");
      console.log("err general")
      return;



    }else{
      if(form.value.password!=form.value.password2){
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
      else if (!isPasswordPolicyValid(form.value.password)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: PASSWORD_POLICY_MESSAGE,
          }
        });
        
        console.log("passowrd validation failed")
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
      else if(!this.yrsExpression.test(form.value.yrs_exp)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The years of experience must not be empty and should not contain only number upto 2 digits.`,
          }
        });
        return;
      }
      else if(!this.registrationNoExpression.test(form.value.reg_no)){
        this.dialog.open(AuthDialogBoxComponent, {
          data: {
            message: `The registration number field must not be empty or should not be less than 6 characters and should contain only numbers and letters without spaces.`,
          }
        });
        return;
      }
      else{
        this.isLoading = true;
        let adhaar = -1;
        let religion = "na";
        let m_status = "na";
        
        if(form.value.adhaar == ""){
          form.value.adhaar=-1;
        }

        this.authService.createDoc(form.value.email, form.value.password, form.value.fname, form.value.lname, form.value.dob, form.value.phone, form.value.edu_details, adhaar, religion, form.value.doc_type, form.value.yrs_exp, form.value.reg_no, m_status).subscribe({
          error: (error) => {
            this.isLoading = false;
            this.dialog.open(AuthDialogBoxComponent, { data: { message: error?.status === 400
              ? 'The password does not meet the password requirements.'
              : 'Unable to complete registration with these details. If you already have an account, log in or reset your password.' } });
          },
        });
        //console.log(form.value);
      }
    }
  }

  passwordStatus(value: unknown) { return getPasswordPolicyStatus(value); }

}

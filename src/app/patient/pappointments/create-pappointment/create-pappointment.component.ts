import { ChangeDetectorRef, Component, NgZone, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

var moment = require('moment');

import { stringify } from 'querystring';
import { PappointmentService } from '../pappointment.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { PaccountService } from '../../paccountverify/paccount.service';

declare var Razorpay: any;

@Component({
    selector: 'app-create-pappointment',
    templateUrl: './create-pappointment.component.html',
    styleUrls: ['./create-pappointment.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CreatePappointmentComponent implements OnInit {
  payment_creation_id = null;

  isSearched = false;
  isAppointmentSet = false;
  appointmentMessage = '';
  private searchSub: Subscription;
  searchedResults: any[];
  isLoading: boolean = false;
  today = new Date();
  minDate;
  maxDate;

  posts: any[] = [];
  posts_available_docs_on_given_date: any[] = [];
  post_as_obj: any = {};

  userIsAuthenticated = false;
  acVerificationDetails: any;
  userId: number;
  userEmail: string;
  private selectedDoctorId: number | null = null;
  private pendingPaymentDetails: { calendar_id: string; doctor_id: number | null } | null = null;
  userPhone: number;
  phoneV: number;
  emailV: number;
  p_consent: number;
  result_v: number;

  charactersLeft = 200;

  doc_types: any[] = [
    { value: 'general_physician', viewValue: 'General Physician' },
    { value: 'cardiologist', viewValue: 'Cardiologist' },
    { value: 'endocrinologist', viewValue: 'Endocrinologist' },
    { value: 'urologist', viewValue: 'Urologist' },
    { value: 'cosmetic_surgeon', viewValue: 'Cosmetic Surgeon' },
    { value: 'orthopedic', viewValue: 'Orthopedic' },
    { value: 'dermatologist', viewValue: 'Dermatologist' },
    { value: 'gastroenterologists', viewValue: 'Gastroenterologist' },
    { value: 'radiologists', viewValue: 'Radiologist' },
    { value: 'oncologists', viewValue: 'Oncologist' },
    { value: 'ophthalmologists', viewValue: 'Ophthalmologist' },
    { value: 'anesthesiologists', viewValue: 'Anesthesiologist' },
    { value: 'plastic_surgeons', viewValue: 'Plastic surgeon' },
    { value: 'pediatricians', viewValue: 'Paediatrician' },
    { value: 'psychiatrists', viewValue: 'Psychiatrist' },
    { value: 'rheumatologists', viewValue: 'Rheumatologist' },
    { value: 'neurologists', viewValue: 'Neurologist' },
    { value: 'nephrologists', viewValue: 'Nephrologist' },
    {
      value: 'hiv_n_infectious_disease_specialists',
      viewValue: 'HIV/infectious disease specialist',
    },
  ];

  razorPayOptions = {
    key: '', // Enter the Key ID generated from the Razorpay Dashboard
    amount: '', // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise or INR 500.
    currency: 'INR',
    name: 'Virtual Sathi',
    description: 'Doctor Fees',
    order_id: 'ORDERID_FROM_BACKEND',
    handler: function (response) {
      //console.log("this is the response ",response);

      const orderDetails = this.pendingPaymentDetails;
      if (!orderDetails) return;
      let doctor_id = orderDetails.doctor_id;
      let email_id = this.authService.getUserEmail();
      //console.log("storage ",sess.calendar_id);

      let verifyPaymentObj = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        calendar_id: orderDetails.calendar_id,
        doctor_id: doctor_id,
        email_id: email_id,
      };
      this.appointmentService.verifyPayment(verifyPaymentObj).subscribe(
        (data) => {
          //console.log("verification data: ", data);
          // this.isAppointmentSet = true;
          // this.isLoading = false;
          this.appointmentMessage = data.message;
          //console.log("appointmentMessage: ", this.appointmentMessage);

          this.ngZone.run(() => this.router.navigate(['/pdashboard']));
          //this.router.navigate(["/pdashboard"]);
        },
        (error) => {
          //console.log(error);
        }
      );
    }.bind(this),
    notes: {
      address: 'Virtualsathi.com',
    },
    theme: {
      color: '#092f6e',
    },
  };

  //"#8bf7a8"

  constructor(
    public appointmentService: PappointmentService,
    public acService: PaccountService,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.minDate = new Date().toISOString().slice(0, 10);
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 14);
    this.maxDate = this.maxDate.toISOString().slice(0, 10);

    this.userId = this.authService.getUserId();

    this.appointmentService.getDoctorTypes().subscribe((postData: any) => {
      this.isLoading = false;

      this.posts = postData.post;

      console.log(this.posts);
    });

    this.acVerificationDetails = this.acService
      .getAccountVerificationDetails(this.userId)
      .subscribe((data: any) => {
        this.userPhone = data.data.mobile;
        this.userEmail = data.data.email;
        this.phoneV = data.data.verify_mob;
        this.emailV = data.data.verify_email;
        this.p_consent = data.data.p_consent;

        this.result_v = this.phoneV * this.emailV * this.p_consent;

        //console.log("result Data: ", data);
        //console.log("phone: ", this.userEmail);
      });
  }

  dateChangedEvent(someDate: any) {
    console.log(someDate);
    this.post_as_obj = {};
    this.appointmentService
      .getDoctorTypesAndAvailability(someDate)
      .subscribe((postData: any) => {
        this.isLoading = false;

        this.posts_available_docs_on_given_date = postData.post;

        console.log(
          'docs on given date:',
          this.posts_available_docs_on_given_date
        );
        for (var i = 0; i < postData.post.length; i++) {
          console.log(postData.post[i].value);
          //Do something
          this.post_as_obj[postData.post[i].value] =
            '' + postData.post[i].doc_count;
        }

        console.log('docs on given date:', this.post_as_obj);
      });
  }

  onTextAreaChange(issueTxt) {
    this.charactersLeft = 200 - issueTxt.length;
  }

  onSubmit(form: NgForm) {
    //console.log(form.value)

    if (form.invalid) {
      if (form.value.appmntDate == '') {
        this.toastr.error('Please enter the appointment date.', 'Input error!');
      }
      if (form.value.docType == '') {
        this.toastr.error('Please select the doctor type.', 'Input error!');
      }
      return;
    } else {
      var d = new Date();
      // d.setDate(form.value.appmntDate.getDate() +0.00000001);
      d.setDate(form.value.appmntDate);

      var momentDate = moment(form.value.appmntDate).format().split('t')[0];
      var momentDateVal = momentDate.split('T')[0];

      // console.log("Form Date", form.value.appmntDate.toISOString().slice(0,10))
      // console.log("New Date",d.toISOString().slice(0,10));
      this.isLoading = true;

      this.appointmentService
        .searchDoc(momentDateVal, form.value.docType)
        .subscribe(
          (data) => {
            if (
              data &&
              data.searchedResults &&
              data.searchedResults.length > 0
            ) {
              // Save the doctor_id from the first result to local storage
              const doctorId = data.searchedResults[0].doctor_id;
              this.selectedDoctorId = Number(doctorId);

              // Handle the rest of the response
              this.searchedResults = data.searchedResults;
              this.isLoading = false;
              this.isSearched = true;
            } else {
              // Handle case where no results are found
              console.log('No search results found');
              this.isLoading = false;
              this.isSearched = false;
            }
          },
          (error) => {
            console.error('Error fetching search results:', error);
            this.isLoading = false;
          }
        );
    }
  }

  onSubmitEmergency(form: NgForm) {
    //console.log(form.value)

    if (form.invalid) {
      if (form.value.appmntDateE == '') {
        this.toastr.error('Please select an appointment date.', 'Input error!');
      }
      if (form.value.detailsE == '') {
        this.toastr.error(
          'Please enter the trouble faced by the patient in brief.',
          'Input error!'
        );
      }
      return;
    } else {
      var d = new Date();
      // d.setDate(form.value.appmntDate.getDate() +0.00000001);
      d.setDate(form.value.appmntDateE);

      var momentDate = moment(form.value.appmntDate).format().split('t')[0];
      var momentDateVal = momentDate.split('T')[0];

      // console.log("Form Date", form.value.appmntDate.toISOString().slice(0,10))
      // console.log("New Date",d.toISOString().slice(0,10));
      this.isLoading = true;

      this.appointmentService
        .requestEmergency(momentDateVal, form.value.detailsE)
        .subscribe((data) => {
          //console.log("result Date: ", data.searchedResults)
          this.toastr.success(
            'The emerency request was submitted successfully!',
            'Input success!'
          );

          window.location.reload();
        });
    }
  }

  bookAppointment(calendar_id: string, amount: string) {
    let finalObject = {
      amount: Number(amount) * 100,
      calendar_id: calendar_id,
      patient_id: this.authService.getUserId(),
    };
    //console.log("this is the final object ",finalObject);
    //console.log("Cal id:", calendar_id);
    this.isLoading = true;
    //this.appointmentService.createAppointment(calendar_id)
    this.appointmentService.createAppointment(finalObject).subscribe(
      (response) => {
        //.subscribe((data) => {
        // console.log("Appointment Res: ", data.message);
        this.appointmentMessage = response.message;
        this.isAppointmentSet = true;
        this.isLoading = false;
        ////////

        //console.log("response for purchase ",response);
        let payload = response['sub'];
        //console.log("Payload:", payload);
        if (response.message != 'success') {
          this.appointmentMessage = response.message;
        }

        if (payload['id'] && payload['amount']) {
          this.razorPayOptions.key = response['ky'];
          this.razorPayOptions.order_id = payload['id'];
          this.razorPayOptions.amount = payload['amount'];
          this.razorPayOptions.handler =
            this.razorPayResponseHandler.bind(this);
          //this.payment_creation_id = payload["dbRes"]["_id"];
          //finalObject["_id"] =payload["dbRes"]["_id"]
          this.pendingPaymentDetails = {
            calendar_id: String(finalObject.calendar_id),
            doctor_id: this.selectedDoctorId,
          };

          //console.log("op",this.razorPayOptions)

          var rzp1 = new Razorpay(this.razorPayOptions);
          rzp1.open();
          //console.log("opened")
        } else {
          // bro show error here
        }
      },
      (error) => {
        console.log('error', error);

        ////////
      }
    );
  }

  razorPayResponseHandler(response) {
    //console.log("this is the response from rzorpay Handler",response);

    const orderDetails = this.pendingPaymentDetails;
    if (!orderDetails) {
      this.toastr.error('Order details not found. Please try again.');
      return;
    }
    let doctor_id = orderDetails.doctor_id;
    let email_id = this.authService.getUserEmail();
    //console.log("storage ",sess.calendar_id);

    let verifyPaymentObj = {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      calendar_id: orderDetails.calendar_id,
      doctor_id: doctor_id,
      email_id: email_id,
    };
    this.appointmentService.verifyPayment(verifyPaymentObj).subscribe(
      (data) => {
        //console.log("verification data: ", data);
        // this.isAppointmentSet = true;
        // this.isLoading = false;
        this.appointmentMessage = data.message;
        this.pendingPaymentDetails = null;
        //console.log("appointmentMessage: ", this.appointmentMessage);

        this.ngZone.run(() => this.router.navigate(['/pdashboard'])); // that is line for comment
        //this.router.navigate(["/pdashboard"]);
      },
      (error) => {
        //console.log(error);
      }
    );
  }
}

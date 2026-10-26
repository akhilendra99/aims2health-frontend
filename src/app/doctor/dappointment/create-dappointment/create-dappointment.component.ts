import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppointmentService } from 'src/app/appointment/appointment.service';
import { AuthService } from 'src/app/auth/auth.service';
var moment = require('moment');

@Component({
    selector: 'app-create-dappointment',
    templateUrl: './create-dappointment.component.html',
    styleUrls: ['./create-dappointment.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CreateDappointmentComponent implements OnInit {
  isLoading = false;
  aptDate: string = '';
  aptToDate: string = '';
  appmnt_times: any[] = [
    { value: '0700', viewValue: '07:00 AM' },
    { value: '0730', viewValue: '07:30 AM' },
    { value: '0800', viewValue: '08:00 AM' },
    { value: '0830', viewValue: '08:30 AM' },
    { value: '0900', viewValue: '09:00 AM' },
    { value: '0930', viewValue: '09:30 AM' },
    { value: '1000', viewValue: '10:00 AM' },
    { value: '1030', viewValue: '10:30 AM' },
    { value: '1100', viewValue: '11:00 AM' },
    { value: '1130', viewValue: '11:30 AM' },
    { value: '1200', viewValue: '12:00 PM' },
    { value: '1230', viewValue: '12:30 PM' },
    { value: '1300', viewValue: '01:00 PM' },
    { value: '1330', viewValue: '01:30 PM' },
    { value: '1400', viewValue: '02:00 PM' },
    { value: '1430', viewValue: '02:30 PM' },
    { value: '1500', viewValue: '03:00 PM' },
    { value: '1530', viewValue: '03:30 PM' },
    { value: '1600', viewValue: '04:00 PM' },
    { value: '1630', viewValue: '04:30 PM' },
    { value: '1700', viewValue: '05:00 PM' },
    { value: '1730', viewValue: '05:30 PM' },
    { value: '1800', viewValue: '06:00 PM' },
    { value: '1830', viewValue: '06:30 PM' },
    { value: '1900', viewValue: '07:00 PM' },
    { value: '1930', viewValue: '07:30 PM' },
    { value: '2000', viewValue: '08:00 PM' },
    { value: '2030', viewValue: '08:30 PM' },
    { value: '2100', viewValue: '09:00 PM' },
    { value: '2130', viewValue: '09:30 PM' },
    { value: '2200', viewValue: '10:00 PM' },
  ];
  time_per_p: any[] = [
    { value: 10, viewValue: '10 mins' },
    { value: 15, viewValue: '15 mins' },
    { value: 30, viewValue: '30 mins' },
  ];
  today = new Date();
  minDate;
  maxDate;
  minToDate;
  constructor(private appointmentService: AppointmentService) {}
  // Add this method
  // This method is 100% safe and works in all browsers
  openDatePicker(input: HTMLInputElement) {
    const inputEl = input as any;

    // Try modern showPicker() first (Chrome/Edge/Firefox latest)
    if (typeof inputEl.showPicker === 'function') {
      inputEl.showPicker();
    } else {
      // Fallback: trigger click (works everywhere)
      input.click();
    }
  }
  ngOnInit(): void {
    this.minDate = new Date().toISOString().slice(0, 10);
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 30);
    this.maxDate = this.maxDate.toISOString().slice(0, 10);

    // let dateCal = new Date();
    // this.minDate = this.today.toISOString().slice(0,10);
    // this.maxDate = dateCal.setDate(this.today.getDate() +14).toISOString().slice(0,10);
    // console.log("min date:", this.minDate)
    // console.log("Max date:", this.maxDate)
  }
  getFormattedDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  setMinMaxdate(fromDate) {
    this.minToDate = fromDate;
    console.log('minToDate:', this.minToDate);
  }

  onSubmit(form: NgForm) {
    if (form.invalid || form.value.appmntToDate < form.value.appmntDate) {
      if (form.invalid) {
        alert('Invalid form Input');
      }

      if (form.value.appmntToDate < form.value.appmntDate) {
        alert("The 'To date' cannot be less than the 'From Date'");
      }
      return;
    } else {
      var mode = 'single';
      if (form.value.appmntDate != form.value.appmntToDate) {
        mode = 'multiple';
      }
      var d = new Date();
      d.setDate(form.value.appmntDate);
      var momentDate = moment(form.value.appmntDate).format().split('t')[0];
      var momentDateVal = momentDate.split('T')[0];
      this.isLoading = true;
      // this.appointmentService.docScheduleAppmnt(momentDateVal, form.value.appmntTime, form.value.timePerPatient, form.value.docFees, form.value.maxPatient);
      this.appointmentService.docScheduleAppmnt(
        mode,
        form.value.appmntDate,
        form.value.appmntToDate,
        form.value.appmntTime,
        form.value.timePerPatient,
        form.value.docFees,
        form.value.maxPatient
      );
    }
  }
}

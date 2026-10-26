import { Component, ViewChild, ElementRef, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
declare var bootstrap: any;

@Component({
    selector: 'app-hauth',
    templateUrl: './patientlist.component.html',
    styleUrls: ['./patientlist.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PatientlistComponent implements OnInit {
  @ViewChild('modalElement') modalRef!: ElementRef;
  modalInstance: any;

  patient = {
    fname: '',
    lname: '',
    email: '',
    password: '',
    countrycode: '91',
    mobile_no: '',
    mobile_secondary: '',
    idType: 'Aadhaar',
    idNumber: '1234-5678-9012',
    gender: '',
    address: '',
    medical_history: '',
    dob: '',
    abhaId: '',
  };

  patients: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPatients();
  }

  openModal() {
    this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement);
    this.modalInstance.show();
  }

  closeModal() {
    if (this.modalInstance) this.modalInstance.hide();
  }

  submitForm() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in local storage.');
      return;
    }

    const payload = {
      ...this.patient,
      id: userId,
    };
    this.http
      .post(environment.apiURL + '/patient/add-patients', payload)
      .subscribe({
        next: (res) => {
          console.log('Patient added:', res);
          this.closeModal();
          this.fetchPatients(); // Refresh patient list after adding
        },
        error: (err) => console.error('Error:', err),
      });
  }

  fetchPatients() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in local storage.');
      return;
    }

    this.http
      .get<{ patients: any[] }>(
        environment.apiURL + '/patient/get-patients?id=' + userId
      )
      .subscribe({
        next: (res) => {
          this.patients = res.patients;
          console.log('Fetched patients:', this.patients);
        },
        error: (err) => console.error('Error fetching patients:', err),
      });
  }
}

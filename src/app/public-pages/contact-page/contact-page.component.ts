import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-contact-page',
    templateUrl: './contact-page.component.html',
    styleUrls: ['./contact-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ContactPageComponent implements OnInit {
  contact = {
    first_name: '',
    last_name: '',
    email: '',
    concern: '',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  submitForm() {
    this.http
      .post<any>(environment.apiURL + '/patient/contact', this.contact)
      .subscribe({
        next: (response) => {
          alert(response.message); // e.g., "Thank you for contacting us. We'll get back to you soon!"
          this.contact = {
            first_name: '',
            last_name: '',
            email: '',
            concern: '',
          }; // clear form
        },
        error: (error) => {
          console.error('Submission error', error);
          alert('Something went wrong. Please try again.');
        },
      });
  }
}

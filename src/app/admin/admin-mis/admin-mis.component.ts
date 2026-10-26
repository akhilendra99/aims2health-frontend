import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-admin-list-patients',
    templateUrl: './admin-mis.component.html',
    styleUrls: ['./admin-mis.component.css'],
    host: { class: 'mis-dark-theme' },
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AdminMISComponent implements OnInit {
  doctors: any[] = [];
  misData: any[] = [];

  selectedDoctor: any = '';
  fromDate: string = '';
  toDate: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllDoctors();
  }

  formatTime(time: string): string {
    if (!time) return '';

    time = time.padStart(4, '0');

    const hours = parseInt(time.substring(0, 2), 10);
    const minutes = time.substring(2, 4);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // ✅ Using env URL for doctor list
  getAllDoctors() {
    this.http.get<any>(`${environment.apiURL}/admin/listdoctors`).subscribe({
      next: (res) => {
        this.doctors = res.post;
      },
      error: (err) => {
        console.error('Doctors API Error', err);
      },
    });
  }

  // ✅ Using env URL for MIS
  getMISData() {
    const payload = {
      doctor_id: Number(this.selectedDoctor),
      from_date: this.fromDate,
      to_date: this.toDate,
    };

    this.http
      .post<any>(`${environment.apiURL}/helper/mis-info`, payload)
      .subscribe({
        next: (res) => {
          this.misData = (res.data || []).map((item: any) => ({
            ...item,
            time: this.formatTime(item.time),
          }));
        },
        error: (err) => {
          console.error('MIS API Error', err);
        },
      });
  }
}

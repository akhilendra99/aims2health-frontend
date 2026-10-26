import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PaccountService } from '../paccountverify/paccount.service';
import { jsPDF } from 'jspdf';

@Component({
    selector: 'app-preceipt',
    templateUrl: './preceipt.component.html',
    styleUrls: ['./preceipt.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PreceiptComponent implements OnInit {
  isLoading = false;
  private authStatusSubs: Subscription;
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  acVerificationDetails: any;
  consentRes: any;
  userId: number;

  appointmentReceipts: any[] = [];

  displayedColumns: string[] = [
    'id',
    'booking_date',
    'booking_time',
    'date',
    'doc_type',
    'fees',
    'receipt',
  ];

  constructor(
    public acService: PaccountService,
    public authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListner()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    this.userId = this.authService.getUserId();

    this.acVerificationDetails = this.acService
      .getAppointmentReceiptDetails(this.userId)
      .subscribe((data: any) => {
        this.appointmentReceipts = data.data.reverse();

        //console.log("result Data: ", this.appointmentReceipts);
        this.isLoading = false;
      });
  }

  downloadReceipt(receiptNumber: number): void {
    //console.log("Receipt No:", receiptNumber);

    const doc = new jsPDF();
    const receiptData = this.appointmentReceipts[receiptNumber];

    doc.setFontSize(16);
    doc.setTextColor(138, 21, 12);
    doc.text('AIMS2Health - Patient Receipt', 10, 10);
    doc.setTextColor(15, 15, 15);

    doc.setFontSize(14);
    doc.text(
      "Doctor's Appointment Payment Receipt                           Receipt No: " +
        receiptData.appointment_id,
      10,
      20
    );

    doc.setFontSize(12);
    doc.text(
      'Patient Id:' +
        this.userId +
        '  Appointment Id:' +
        receiptData.appointment_id +
        ' Calendar Id:' +
        receiptData.calendar_id,
      10,
      40
    );

    doc.text('Booking Date-Time:' + receiptData.booking_date_time, 10, 50);
    //doc.text('Doctor Type               Appointment Date                Appointment Time                Amount Paid               ',10,70);
    doc.text('Doctor Type', 10, 70);

    doc.text('Appointment Date', 70, 70);
    doc.text('Appointment Time', 110, 70);
    doc.text('Amount Paid', 160, 70);

    doc.text('' + receiptData.doc_type, 10, 80);
    doc.text('' + receiptData.date.split('-').reverse().join('/ '), 70, 80);
    doc.text(
      '' +
        receiptData.time.substring(0, 2) +
        ':' +
        '' +
        receiptData.time.substring(2, 4) +
        ' Hrs',
      110,
      80
    );
    doc.text('Rs ' + receiptData.fees + '/-', 160, 80);

    //doc.text(receiptData.doc_type+'             '+receiptData.date+'                      '+receiptData.time+' Hrs                          Rs'+receiptData.fees+'/-',10,80);
    doc.text('Exempted category, GST not applicable.', 10, 100);

    doc.setFontSize(12);
    doc.setTextColor(138, 21, 12);
    doc.text(
      'This is an auto-generated receipt, signature is not required.',
      10,
      120
    );
    doc.setFontSize(16);

    doc.setProperties({
      title: 'Appointment booking receipt for User:' + this.userId,
      subject: 'Appointment booking receipt',
      author: '' + this.userId,
      keywords: 'receipt, e-consent',
      creator: 'AIMS2Health',
    });

    doc.save(
      'e-receipt-' + this.userId + '-' + receiptData.appointment_id + '.pdf'
    );
  }
}

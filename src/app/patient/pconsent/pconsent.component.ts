import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PaccountService } from '../paccountverify/paccount.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
    selector: 'app-pconsent',
    templateUrl: './pconsent.component.html',
    styleUrls: ['./pconsent.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PconsentComponent implements OnInit {
  isLoading = false;
  private authStatusSubs: Subscription;
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  acVerificationDetails: any;
  consentRes: any;
  userId: number;
  userEmail: string;
  userPhone: number;
  pconsent: number;
  pconsent_ip: string;
  pconsent_date: string;
  pconsent_time: string;
  ipAddress: any;

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
      .getAccountVerificationDetails(this.userId)
      .subscribe((data: any) => {
        this.userPhone = data.data.mobile;
        this.userEmail = data.data.email;
        this.pconsent = data.data.p_consent;
        if (data.data.p_consent_date != null) {
          this.pconsent_date = data.data.p_consent_date
            .split(' ')[0]
            .split('-')
            .reverse()
            .join('-');
          this.pconsent_time = data.data.p_consent_date.split(' ')[1];
        }
        if (data.data.p_consent_ipaddr != null) {
          this.pconsent_ip = data.data.p_consent_ipaddr;
        }

        //console.log("result Data: ", data);
        //console.log("phone: ", this.userEmail);
        this.isLoading = false;
      });

    this.getIPAddress();
    // .subscribe((ipData) => {
    //   console.log(ipData);
    // })
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  getIPAddress() {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => {
        this.ipAddress = data.ip;
        console.log('IP Address:', this.ipAddress);
      })
      .catch((error) => {
        console.error('Failed to get IP:', error);
      });
  }

  consent(form: NgForm) {
    if (form.value.consent != true) {
      return;
    } else {
      //console.log("Sending Consent To Backend");
      //console.log("This IP", this.ipAddress);
      this.consentRes = this.acService
        .sendPConsent('' + this.ipAddress)
        .subscribe((data: any) => {
          //console.log("send consent res: ", data);
          //console.log("phone: ", this.userEmail);
          this.ngOnInit();
        });
    }
  }

  downloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(138, 21, 12);
    doc.text('AIMS2Health Telemedicine E-Consent', 10, 10);
    doc.setTextColor(15, 15, 15);

    doc.setFontSize(20);
    doc.text(
      'I Provided my consent after agreeing upon the following points:',
      10,
      30
    );

    doc.setFontSize(12);
    doc.text(
      'I understand that the laws that protect privacy and the confidentiality of medical information\nalso apply to telemedicine, and that no information obtained in the use of telemedicine which\nidentifies me will be disclosed to researchers or other entities without my consent.',
      10,
      40
    );
    doc.text(
      'I understand that I have the right to withhold or withdraw my consent to the use of\ntelemedicine in the course of my care at any time, without affecting my right to future care or treatment.',
      10,
      60
    );
    doc.text(
      'I understand that I have the right to inspect all information obtained and recorded in the\ncourse of a telemedicine interaction, and may receive copies of this information for a\nreasonable fee.',
      10,
      80
    );
    doc.text(
      'I understand that a variety of alternative methods of medical care may be available to me, and\nthat I may choose one or more of these at any time. My ophthalmologist has explained the\nalternatives to my satisfaction.',
      10,
      100
    );
    doc.text(
      'I understand that telemedicine may involve electronic communication of my personal medical\ninformation to other medical practitioners who may be located in other areas, including out of state.',
      10,
      120
    );
    doc.text(
      'I understand that it is my duty to inform my ophthalmologist of electronic interactions\nregarding my care that I may have with other healthcare providers.',
      10,
      140
    );
    doc.text(
      'I understand that I may expect the anticipated benefits from the use of telemedicine in my\ncare, but that no results can be guaranteed or assured.',
      10,
      160
    );

    doc.setFontSize(18);
    doc.setTextColor(138, 21, 12);
    doc.text(
      'E-Consent was provided by the patient, with below details:',
      10,
      180
    );
    doc.setFontSize(16);

    doc.text('Patient Id: ' + this.userId, 10, 200);
    doc.text('Patient Phone: ' + this.userPhone, 10, 210);
    doc.text('Patient Email: ' + this.userEmail, 10, 220);
    doc.text('Consent Date: ' + this.pconsent_date, 10, 230);
    doc.text('Consent Time: ' + this.pconsent_time, 10, 240);
    doc.text('From IP Address: ' + this.pconsent_ip, 10, 250);
    doc.text(
      'I hereby authorize AIMS2Health to use telemedicine \nin the course of my diagnosis and treatment.',
      10,
      270
    );
    doc.setProperties({
      title: 'E-Consent-PDF for User:' + this.userId,
      subject: 'E-Consent for telemedecine - proof',
      author: '' + this.userId,
      keywords: 'consent, e-consent',
      creator: 'AIMS2Health',
    });

    doc.save('e-consent-' + this.userId + '.pdf');
  }
}

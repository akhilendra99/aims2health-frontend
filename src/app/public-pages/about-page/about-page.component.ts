import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';


@Component({
    selector: 'app-about-page',
    templateUrl: './about-page.component.html',
    styleUrls: ['./about-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AboutPageComponent implements OnInit {

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: true
  }
  
    slides = [
      {id: 1, img: "assets/images/dr-gogia.jpg",name: "Dr. Shashi Bhushan Gogia" ,position: "Director-Technology and Healthcare Informatics", details: "MBBS and MS (General Surgery, both from AIIMS, New Delhi) General Surgeon with special interests in Plastic Surgery, Hand Surgery & Lymphoedema; Medical Informatics; and Telemedicine. Dr. Gogia's professional surgical career of over 39 years spans other diverse interests and competencies, such as, co-author cum editor of a book, Fundamentals of Telemedicine and Telehealth (Elsevier), Fellow, International Academy of Health Science Informatics and Member, Bureau of Indian Standards MHD 17 Taskforce on Health Information Technolgy Standards."},
      {id: 2, img: "assets/images/dr-praveen-gupta.jpg",name: "Dr. Parveen Gupta" ,position: "Director- Medical Specialities", details: "MBBS and MD (General Medicine, both from AIIMS, New Delhi) Dr. Gupta's professional medical career of over 39 years essentially is built around the regionally well-known hospital, Delhi Hospital and Maternity Home, that he and his wife, a Gynaecologist, set up, own, and runs in Jind, Haryana. Dr. Gupta has an abiding interest in health information technology as a hobby."},
      {id: 3, img: "assets/images/dr-vinod-agarwal.jpg",name: "Dr. Vinod Aggarwal" ,position: "Director-Finance, Accounts and Audit", details: "MBBS (AIIMS, New Delhi, MBA (Australia), PG Diploma (Geriatric Medicine) Dr. Aggarwal, as an IAS officer, served for some 37 years at the topmost levels in District, Regional, and State governments in Bihar and Jharkhand and in the Central Government. He retired as Secretary, Department of Empowerment of Persons with Disabilities & Chairperson, Rehabilitation Council of India. In the State level, he also served as Secretary, Health and Medical Education."},
      {id: 4, img: "assets/images/dr-johori.jpg",name: "Dr. Harsh Kumar Johri" ,position: "Director-Surgical Specialities", details: "Dr. Harsh Kumar Johri is a Founder Director, Combined Medical Institute Private Limited, which is a Private incorporated on 07 May 1999 in Dehradun, Uttrakhand. Since 1986 he is also running the Johri Nursing Home in Dehradun. It is dedicated to Orthopedic surgery. He was a Senior Resident, Orthopedics, Maulana Azad Medical College, Delhi."},
    ];

  constructor() { }

  ngOnInit(): void {
  }

}

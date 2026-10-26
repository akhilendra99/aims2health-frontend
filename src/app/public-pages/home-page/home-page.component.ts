import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css', 'owl.carousel.min.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomePageComponent implements OnInit {
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    margin: 10,
    stagePadding: 10,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
        nav: true,
      },
      600: {
        items: 2,
        nav: true,
      },
      1000: {
        items: 3,
        nav: true,
      },
    },
    nav: true,
  };

  slides = [
    {
      id: 1,
      img: 'assets/images/dr-gogia.jpg',
      name: 'Dr. Shashi Bhushan Gogia',
      position: 'Director-Technology and Healthcare Informatics',
      details:
        "MBBS and MS (General Surgery, both from AIIMS, New Delhi) General Surgeon with special interests in Plastic Surgery, Hand Surgery & Lymphoedema; Medical Informatics; and Telemedicine. Dr. Gogia's professional surgical career of over 39 years spans other diverse interests and competencies, such as, co-author cum editor of a book, Fundamentals of Telemedicine and Telehealth (Elsevier), Fellow, International Academy of Health Science Informatics and Member, Bureau of Indian Standards MHD 17 Taskforce on Health Information Technolgy Standards.",
    },
    {
      id: 2,
      img: 'assets/images/dr-praveen-gupta.jpg',
      name: 'Dr. Parveen Gupta',
      position: 'Director- Medical Specialities',
      details:
        "MBBS and MD (General Medicine, both from AIIMS, New Delhi) Dr. Gupta's professional medical career of over 39 years essentially is built around the regionally well-known hospital, Delhi Hospital and Maternity Home, that he and his wife, a Gynaecologist, set up, own, and runs in Jind, Haryana. Dr. Gupta has an abiding interest in health information technology as a hobby.",
    },
    {
      id: 3,
      img: 'assets/images/dr-vinod-agarwal.jpg',
      name: 'Dr. Vinod Aggarwal',
      position: 'Director-Finance, Accounts and Audit',
      details:
        'MBBS (AIIMS, New Delhi, MBA (Australia), PG Diploma (Geriatric Medicine) Dr. Aggarwal, as an IAS officer, served for some 37 years at the topmost levels in District, Regional, and State governments in Bihar and Jharkhand and in the Central Government. He retired as Secretary, Department of Empowerment of Persons with Disabilities & Chairperson, Rehabilitation Council of India. In the State level, he also served as Secretary, Health and Medical Education.',
    },
    {
      id: 4,
      img: 'assets/images/dr-johori.jpg',
      name: 'Dr. Harsh Kumar Johri',
      position: 'Director-Surgical Specialities',
      details:
        'Dr. Harsh Kumar Johri is a Founder Director, Combined Medical Institute Private Limited, which is a Private incorporated on 07 May 1999 in Dehradun, Uttrakhand. Since 1986 he is also running the Johri Nursing Home in Dehradun. It is dedicated to Orthopedic surgery. He was a Senior Resident, Orthopedics, Maulana Azad Medical College, Delhi.',
    },
    {
      id: 5,
      img: 'assets/images/dr-gogia.jpg',
      name: 'Dr. Shashi Bhushan Gogia',
      position: 'Director-Technology and Healthcare Informatics',
      details:
        "MBBS and MS (General Surgery, both from AIIMS, New Delhi) General Surgeon with special interests in Plastic Surgery, Hand Surgery & Lymphoedema; Medical Informatics; and Telemedicine. Dr. Gogia's professional surgical career of over 39 years spans other diverse interests and competencies, such as, co-author cum editor of a book, Fundamentals of Telemedicine and Telehealth (Elsevier), Fellow, International Academy of Health Science Informatics and Member, Bureau of Indian Standards MHD 17 Taskforce on Health Information Technolgy Standards.",
    },
    {
      id: 6,
      img: 'assets/images/dr-praveen-gupta.jpg',
      name: 'Dr. Parveen Gupta',
      position: 'Director- Medical Specialities',
      details:
        "MBBS and MD (General Medicine, both from AIIMS, New Delhi) Dr. Gupta's professional medical career of over 39 years essentially is built around the regionally well-known hospital, Delhi Hospital and Maternity Home, that he and his wife, a Gynaecologist, set up, own, and runs in Jind, Haryana. Dr. Gupta has an abiding interest in health information technology as a hobby.",
    },
    {
      id: 7,
      img: 'assets/images/dr-vinod-agarwal.jpg',
      name: 'Dr. Vinod Aggarwal',
      position: 'Director-Finance, Accounts and Audit',
      details:
        'MBBS (AIIMS, New Delhi, MBA (Australia), PG Diploma (Geriatric Medicine) Dr. Aggarwal, as an IAS officer, served for some 37 years at the topmost levels in District, Regional, and State governments in Bihar and Jharkhand and in the Central Government. He retired as Secretary, Department of Empowerment of Persons with Disabilities & Chairperson, Rehabilitation Council of India. In the State level, he also served as Secretary, Health and Medical Education.',
    },
    {
      id: 4,
      img: 'assets/images/dr-johori.jpg',
      name: 'Dr. Harsh Kumar Johri',
      position: 'Director-Surgical Specialities',
      details:
        'Dr. Harsh Kumar Johri is a Founder Director, Combined Medical Institute Private Limited, which is a Private incorporated on 07 May 1999 in Dehradun, Uttrakhand. Since 1986 he is also running the Johri Nursing Home in Dehradun. It is dedicated to Orthopedic surgery. He was a Senior Resident, Orthopedics, Maulana Azad Medical College, Delhi.',
    },
  ];

  slides_infos = [
    {
      id: 1,
      img: 'assets/images/aims2health-1st-opinion.png',
      title:
        'Consensus guidance of AIIMS-trained specialists on treatment of COVID 19',
      body: 'Simplified and basic guidance for patients and their family doctors. It is based on consensus of five AIIMS-trained specialists with over 40 years of practical experience of each.',
      url: 'http://virtualsathi.in',
    },
    {
      id: 3,
      img: 'assets/images/faq-covid-small.png',
      title: "FAQ's on all aspects of Covid",
      body: 'In the face of this unprecedented pandemic, AIMS2HEALTH is working to support COVID-19 response and to maintain and restore routine immunisation..What should you do if You or Someone You Know is Sick or Had Contact with Someone who Has COVID-19.',
      url: '#',
    },
    {
      id: 4,
      img: 'assets/images/equivalant-seroid-small.png',
      title: 'Standard Protocol for COVID-19',
      body: "COVID19 guidelines, sentinel surveillance and special surveillance of WGS of SARS-Cov-2. Standard precautions include hand hygiene; use of PPE to avoid direct contact with patients' blood, body fluids, secretions (including respiratory),tests, tearment.",
      url: '#',
    },
    {
      id: 5,
      img: 'assets/images/child-covid-small.png',
      title: 'Managing COVID-19 infection in infants and children',
      body: 'Children with Covid-19 infection may have fever, throat discomfort, cough, runny nose, abdominal pain and loose stools. Older children may complain of headache and tiredness. A RT PCR test confirms the diagnosis.',
      url: '#',
    },
    {
      id: 6,
      img: 'assets/images/equivalant-seroid-small.png',
      title: 'Guidance to Patients on Equivalent Dose of Steroids for COVID-19',
      body: 'For adult COVID patients who are serious, who cannot find a hospital bed and whose Oxygen has dropped to 90% or lower and who need to be put on oral steroids have to be given a particular steroid medication in two equal parts, 12 hours apart.',
      url: '#',
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}

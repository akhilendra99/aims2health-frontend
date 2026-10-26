import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Entry } from 'contentful';
import { ContentService } from '../content-management.service';

@Component({
    selector: 'app-doctorsprofile',
    templateUrl: './doctorsprofile.component.html',
    styleUrls: ['./doctorsprofile.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DoctorsprofileComponent implements OnInit {

  
  doc_contents: Entry<any>[] = [];
  host_contents: Entry<any>[] = [];


  constructor(private router: Router, private contentService: ContentService ) { }

  ngOnInit(): void {
    this.contentService.getDocProfiles()
    .then(contents => {
      this.doc_contents = contents;
      //console.log(this.contents);
    });

    this.contentService.getHostProfiles()
    .then(contents => {
      this.host_contents = contents;
      //console.log(this.contents);
    });
  }

  // gotoContentDetailsPage(contentId){
  //   this.router.navigate(['/indepthnews', contentId]);
  // }

}

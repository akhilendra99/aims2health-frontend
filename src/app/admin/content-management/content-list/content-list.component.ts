import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from '../content-management.service';
import { Entry } from 'contentful';

@Component({
    selector: 'app-content-list',
    templateUrl: './content-list.component.html',
    styleUrls: ['./content-list.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ContentListComponent implements OnInit {

  contents: Entry<any>[] = [];


  constructor(private router: Router, private contentService: ContentService ) { }

  ngOnInit(): void {
    this.contentService.getContents()
    .then(contents => {
      this.contents = contents;
      //console.log(this.contents);
    });
  }

  gotoContentDetailsPage(contentId){
    this.router.navigate(['/indepthnews', contentId]);
  }

}

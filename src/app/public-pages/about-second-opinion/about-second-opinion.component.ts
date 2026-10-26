import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-about-second-opinion',
    templateUrl: './about-second-opinion.component.html',
    styleUrls: ['./about-second-opinion.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AboutSecondOpinionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

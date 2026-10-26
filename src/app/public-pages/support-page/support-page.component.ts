import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-support-page',
    templateUrl: './support-page.component.html',
    styleUrls: ['./support-page.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SupportPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

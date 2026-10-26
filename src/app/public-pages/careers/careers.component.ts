import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-careers',
    templateUrl: './careers.component.html',
    styleUrls: ['./careers.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CareersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

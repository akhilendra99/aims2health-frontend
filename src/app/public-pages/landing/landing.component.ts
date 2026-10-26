import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class LandingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

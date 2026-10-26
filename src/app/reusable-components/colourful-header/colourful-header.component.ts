import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-colourful-header',
    templateUrl: './colourful-header.component.html',
    styleUrls: ['./colourful-header.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ColourfulHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

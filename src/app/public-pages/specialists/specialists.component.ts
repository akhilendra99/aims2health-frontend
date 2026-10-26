import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-specialists',
    templateUrl: './specialists.component.html',
    styleUrls: ['./specialists.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SpecialistsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

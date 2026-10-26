import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-one-stop-solution',
    templateUrl: './one-stop-solution.component.html',
    styleUrls: ['./one-stop-solution.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OneStopSolutionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

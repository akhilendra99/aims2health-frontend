import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-reusable-components',
    templateUrl: './reusable-components.component.html',
    styleUrls: ['./reusable-components.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ReusableComponentsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-helper',
    templateUrl: './helper.component.html',
    styleUrls: ['./helper.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HelperComponent implements OnInit {


  isLoading =false;

  constructor() { }

  ngOnInit(): void {
  }

}

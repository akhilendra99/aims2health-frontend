import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-blank-header',
    templateUrl: './blank-header.component.html',
    styleUrls: ['./blank-header.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class BlankHeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

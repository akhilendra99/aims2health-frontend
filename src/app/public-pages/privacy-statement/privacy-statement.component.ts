import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-privacy-statement',
    templateUrl: './privacy-statement.component.html',
    styleUrls: ['./privacy-statement.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PrivacyStatementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-refund-and-cancellation',
    templateUrl: './refund-and-cancellation.component.html',
    styleUrls: ['./refund-and-cancellation.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class RefundAndCancellationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-cancellation-refund-policy',
    templateUrl: './cancellation-refund-policy.component.html',
    styleUrls: ['./cancellation-refund-policy.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CancellationRefundPolicyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

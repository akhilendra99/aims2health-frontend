import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-price-and-payment',
    templateUrl: './price-and-payment.component.html',
    styleUrls: ['./price-and-payment.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PriceAndPaymentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

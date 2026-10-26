import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PricingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

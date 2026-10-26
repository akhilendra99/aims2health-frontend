import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-dappointment',
    templateUrl: './dappointment.component.html',
    styleUrls: ['./dappointment.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DappointmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

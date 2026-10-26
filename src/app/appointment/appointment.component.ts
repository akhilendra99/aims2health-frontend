import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-appointment',
    templateUrl: './appointment.component.html',
    styleUrls: ['./appointment.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AppointmentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

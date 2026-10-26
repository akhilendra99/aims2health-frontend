import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-patient',
    templateUrl: './patient.component.html',
    styleUrls: ['./patient.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PatientComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

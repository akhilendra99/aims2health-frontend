import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-doctor',
    templateUrl: './doctor.component.html',
    styleUrls: ['./doctor.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DoctorComponent implements OnInit {

  constructor() { }
  isLoading =false;
  ngOnInit(): void {
  }

}

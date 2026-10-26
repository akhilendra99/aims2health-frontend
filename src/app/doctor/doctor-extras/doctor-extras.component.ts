import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-doctor-extras',
    templateUrl: './doctor-extras.component.html',
    styleUrls: ['./doctor-extras.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DoctorExtrasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

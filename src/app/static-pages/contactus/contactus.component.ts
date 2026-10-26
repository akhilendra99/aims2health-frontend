import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-contactus',
    templateUrl: './contactus.component.html',
    styleUrls: ['./contactus.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ContactusComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-partners',
    templateUrl: './partners.component.html',
    styleUrls: ['./partners.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PartnersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

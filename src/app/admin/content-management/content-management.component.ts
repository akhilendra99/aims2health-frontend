import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-content-management',
    templateUrl: './content-management.component.html',
    styleUrls: ['./content-management.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ContentManagementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

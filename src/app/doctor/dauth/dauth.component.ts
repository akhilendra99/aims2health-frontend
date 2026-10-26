import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-dauth',
    templateUrl: './dauth.component.html',
    styleUrls: ['./dauth.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DauthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

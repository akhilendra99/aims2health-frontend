import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-hauth',
    templateUrl: './hauth.component.html',
    styleUrls: ['./hauth.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HauthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-pauth',
    templateUrl: './pauth.component.html',
    styleUrls: ['./pauth.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PauthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

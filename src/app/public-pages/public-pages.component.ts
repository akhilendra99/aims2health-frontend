import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-public-pages',
    templateUrl: './public-pages.component.html',
    styleUrls: ['./public-pages.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PublicPagesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

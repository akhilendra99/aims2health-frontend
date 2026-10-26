import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-static-pages',
    templateUrl: './static-pages.component.html',
    styleUrls: ['./static-pages.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class StaticPagesComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

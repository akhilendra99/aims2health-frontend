import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-aboutus',
    templateUrl: './aboutus.component.html',
    styleUrls: ['./aboutus.component.css', './style.css', './bootstrap.min.css', './default.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AboutusComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

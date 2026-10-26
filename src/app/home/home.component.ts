import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css', './style.css', './bootstrap.min.css', './default.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HomeComponent implements OnInit {

  images = {img:"assets/images/cover.jpg"};
  constructor() { }

  ngOnInit(): void {
  }

}

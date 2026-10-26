import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-howitworks',
    templateUrl: './howitworks.component.html',
    styleUrls: ['./howitworks.component.css', './style.css', './bootstrap.min.css', './default.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HowitworksComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

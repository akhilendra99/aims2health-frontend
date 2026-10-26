import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-press-media',
    templateUrl: './press-media.component.html',
    styleUrls: ['./press-media.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PressMediaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

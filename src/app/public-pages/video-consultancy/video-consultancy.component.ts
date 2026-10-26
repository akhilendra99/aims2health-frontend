import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-video-consultancy',
    templateUrl: './video-consultancy.component.html',
    styleUrls: ['./video-consultancy.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class VideoConsultancyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-testimonial',
    templateUrl: './testimonial.component.html',
    styleUrls: ['./testimonial.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TestimonialComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

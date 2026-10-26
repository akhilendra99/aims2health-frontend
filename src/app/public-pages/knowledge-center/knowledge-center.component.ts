import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-knowledge-center',
    templateUrl: './knowledge-center.component.html',
    styleUrls: ['./knowledge-center.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class KnowledgeCenterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

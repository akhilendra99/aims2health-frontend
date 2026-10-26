import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-code-ethics',
    templateUrl: './code-ethics.component.html',
    styleUrls: ['./code-ethics.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CodeEthicsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

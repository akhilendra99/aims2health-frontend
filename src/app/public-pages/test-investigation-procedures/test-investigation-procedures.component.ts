import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-test-investigation-procedures',
    templateUrl: './test-investigation-procedures.component.html',
    styleUrls: ['./test-investigation-procedures.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TestInvestigationProceduresComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

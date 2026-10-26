import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-pmedreport',
    templateUrl: './pmedreport.component.html',
    styleUrls: ['./pmedreport.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PmedreportComponent implements OnInit {

  @Input() inputValue: string;
  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ErrorComponent implements OnInit {

  // message = 'An Unknown error occurred';
  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string}) { }

  ngOnInit(): void {
  }

  reload(){
  
    window.location.reload();

  }

}

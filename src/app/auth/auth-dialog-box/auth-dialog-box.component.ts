import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-auth-dialog-box',
    templateUrl: './auth-dialog-box.component.html',
    styleUrls: ['./auth-dialog-box.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class AuthDialogBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {message: string, docEmail: string}) { }

  ngOnInit(): void {
  }

}

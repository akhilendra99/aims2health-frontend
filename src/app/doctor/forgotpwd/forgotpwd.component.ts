import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-forgotpwd',
    templateUrl: './forgotpwd.component.html',
    styleUrls: ['./forgotpwd.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ForgotpwdComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
